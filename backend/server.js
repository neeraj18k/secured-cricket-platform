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

// 2. Email Transporter (Use Environment Variables in Render)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 3. User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 4. Signup Route (With Welcome Email)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, msg: "User already exists" });

        user = new User({ username: name, email, password });
        await user.save();

        // Welcome Email (Neeraj's Branding)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Secure Cricket! 🏏 (Built by Neeraj)',
            html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #1e1b4b;">Hello ${name}! 👋</h2>
                    <p>Welcome to the platform built by <b>Neeraj</b>.</p>
                    <p>Login to see your real-time analytics.</p>
                   </div>`
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

// 5. Login Route (FIX FOR DASHBOARD CRASH)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ success: false, msg: "Invalid Credentials" });
        }

        // IMPORTANT: Sending 'name' to satisfy Dashboard.jsx
        res.json({ 
            success: true, 
            user: { 
                id: user._id, 
                name: user.username, // 👈 Frontend 'user.name' yahan se lega
                email: user.email 
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});

// 6. Dashboard Cricket Data Routes (To prevent 404s)
app.get('/api/cricket/upcoming', (req, res) => res.json([]));
app.get('/api/cricket/news', (req, res) => res.json([]));
app.get('/api/cricket/players', (req, res) => res.json([]));
app.get('/api/cricket/standings', (req, res) => res.json([]));
app.get('/api/cricket/match-status', (req, res) => res.json({ 
    match: "No Live Match", 
    venue: "Stadium", 
    homeTeam: { name: "Team A", score: "0/0", overs: 0 },
    stats: { projected: 0, winProb: "0%", crr: 0, partnership: "0" }
}));
app.get('/api/cricket/analytics', (req, res) => res.json({ 
    recentOvers: [], 
    runProgression: [], 
    phaseAnalysis: [], 
    commentary: [] 
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));