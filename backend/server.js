require('dotenv').config(); //
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. MongoDB Connection
const mongoURI = process.env.MONGODB_URI; 
mongoose.connect(mongoURI)
    .then(() => console.log('✅✅✅ MONGODB CONNECTED SUCCESSFULLY!'))
    .catch(err => console.log('❌ Connection Error:', err));

// 2. User Schema (Validation Error Fix)
const userSchema = new mongoose.Schema({
    // Isko 'required: false' rakha hai taaki agar frontend se name na bhi aaye toh crash na ho
    username: { type: String, required: false, default: "User" }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { strict: false }); //

const User = mongoose.model('User', userSchema);

// 3. Signup Route
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Frontend ke 'name' field ko 'username' mein map karna
        const finalUsername = username || name || "User";

        user = new User({ 
            username: finalUsername, 
            email, 
            password 
        });
        
        await user.save(); //
        res.status(201).json({ msg: "User registered successfully!" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// 4. Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });
        if (user.password !== password) return res.status(400).json({ msg: "Invalid Credentials" });

        res.json({ msg: "Login successful!", user: { username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));