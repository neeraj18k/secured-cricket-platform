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

// 2. Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 3. User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, default: "User" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 4. Signup Route
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
            text: `Hi ${name || 'User'},\n\nAccount created successfully!`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) console.log("📧 Email Error:", error);
            else console.log("📧 Email Sent");
        });

        res.status(201).json({ success: true, msg: "User registered!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. Login Route (FIXED FOR DASHBOARD CRASH)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ success: false, msg: "Invalid Credentials" });
        }

        // Frontend ko 'name' chahiye dashboard ke liye
        res.json({ 
            success: true, 
            user: { 
                id: user._id, 
                username: user.username, 
                name: user.username, // 👈 Ye 'name' frontend crash hone se bachaega
                email: user.email 
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});

// 6. Missing Cricket Routes (Fix for 404s)
app.get('/api/cricket/upcoming', (req, res) => res.json([]));
app.get('/api/cricket/news', (req, res) => res.json([]));
app.get('/api/cricket/players', (req, res) => res.json([]));
app.get('/api/cricket/standings', (req, res) => res.json([]));
app.get('/api/cricket/match-status', (req, res) => res.json({ status: "No Live Matches" }));
app.get('/api/cricket/analytics', (req, res) => res.json({ visitors: 1 }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));