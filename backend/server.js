require('dotenv').config(); // Sabse upar hona chahiye
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

// 2. User Schema & Model (Database ki structure)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// 3. Signup Route (Naya user banane ke liye)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check karein ki user pehle se toh nahi hai
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Naya user save karein
        user = new User({ username, email, password });
        await user.save(); 

        res.status(201).json({ msg: "User registered successfully in MongoDB!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// 4. Login Route (User verify karne ke liye)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // User ko database mein dhoondein
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        // Password check karein (abhi simple text match ho raha hai)
        if (user.password !== password) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        res.json({ msg: "Login successful!", user: { username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// 5. Admin Route: Sabhi users dekhne ke liye
app.get('/api/auth/admin/all-users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Password chhupa kar baki data dikhayega
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));