require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

// 1. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ Connection Error:', err));

// 2. Email Transporter (Credentials Hidden in Environment Variables)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Render se uthayega
        pass: process.env.EMAIL_PASS  // Render se uthayega
    }
});

// 3. User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, default: "User" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 4. Signup Route with Email
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, msg: "User already exists" });

        user = new User({ username: name, email, password });
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Our Platform! 🎉',
            text: `Hi ${name || 'User'},\n\nWelcome to our platform! Account created successfully.`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) console.log("Email Failed:", err);
            else console.log("Email Sent to:", email);
        });

        res.status(201).json({ success: true, msg: "User registered!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. Login Route (Dashboard Fix)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ success: false, msg: "Invalid Credentials" });
        }

        res.json({ 
            success: true, 
            user: { id: user._id, username: user.username, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));