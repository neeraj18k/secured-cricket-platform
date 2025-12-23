require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

// 1. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

// 2. Email Transporter Setup (Using Render Env Variables)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Your 16-digit App Password
    }
});

// 3. User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, default: "User" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// 4. Auth Routes (Signup & Login)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, msg: "User already exists" });

        user = new User({ username: name, email, password });
        await user.save();

        // Welcome Email Logic
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Our Cricket Platform! 🎉',
            text: `Hi ${name || 'User'},\n\nWelcome! Your account has been created. Happy Cricket!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log("📧 Email Error:", error);
            else console.log("📧 Email Sent: " + info.response);
        });

        res.status(201).json({ success: true, msg: "User registered!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

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

// 5. Dashboard Data Routes (FIX for 404 Errors)
// Frontend expect kar raha hai ye routes data dikhane ke liye
app.get('/api/cricket/upcoming', (req, res) => res.json([]));
app.get('/api/cricket/news', (req, res) => res.json([]));
app.get('/api/cricket/players', (req, res) => res.json([]));
app.get('/api/cricket/standings', (req, res) => res.json([]));
app.get('/api/cricket/match-status', (req, res) => res.json({ status: "No Live Matches" }));
app.get('/api/cricket/analytics', (req, res) => res.json({ visitors: 10, status: "Active" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));