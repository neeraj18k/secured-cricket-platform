require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // For reset tokens

const app = express();
app.use(express.json());
app.use(cors());

// 1. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Connection Error:', err));

// 2. Email Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Ensure NO SPACES in Render settings
    }
});

// 3. User Schema (Added reset token fields)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiry: Date
});
const User = mongoose.model('User', userSchema);

// --- ROUTES ---

// 4. SIGNUP (With Email Fix)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: "User exists" });

        user = new User({ username, email, password });
        await user.save();
        console.log("✅ User Saved:", email);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Secure Cricket! 🏏',
            html: `<h3>Hello ${username}, welcome to the platform built by Neeraj!</h3>`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) console.log("📧 Signup Email Error:", err);
            else console.log("📧 Signup Email Sent!");
        });

        res.status(201).json({ success: true, message: "Signup Success!" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// 5. LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(400).json({ success: false, message: "Wrong Credentials" });

        res.json({ success: true, user: { id: user._id, name: user.username, email: user.email } });
    } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

// 6. FORGOT PASSWORD (Fixed for MongoDB)
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ Forgot Pass: User not found for", email);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate Token
        const token = crypto.randomBytes(20).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetLink = `https://secured-cricket-platform.vercel.app/reset-password/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request 🔒',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) console.log("📧 Reset Email Error:", err);
            else console.log("📧 Reset Email Sent!");
        });

        res.json({ success: true, message: "Reset link sent to email!" });
    } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

// 7. DASHBOARD DATA (Restored)
app.get('/api/cricket/match-status', (req, res) => res.json({
    match: "IND vs AUS", venue: "MCG", homeTeam: { name: "India", score: "192/3", overs: 19.1 },
    stats: { projected: "205", winProb: "85%", crr: "10.05", partnership: "74 (32)" }
}));
app.get('/api/cricket/analytics', (req, res) => res.json({
    recentOvers: [{score: "4", type: "boundary"}, {score: "6", type: "six"}],
    runProgression: [{over: 1, runs: 12}, {over: 15, runs: 152}],
    phaseAnalysis: [{name: "Powerplay", runs: 58}],
    commentary: [{over: "19.1", text: "SIX!"}]
}));
app.get('/api/cricket/news', (req, res) => res.json([{ id: 1, title: "Kohli's Masterclass", time: "5m ago" }]));
app.get('/api/cricket/players', (req, res) => res.json([{ id: 1, name: "Virat Kohli", role: "Batsman", stats: { runs: 82 } }]));
app.get('/api/cricket/standings', (req, res) => res.json([{ rank: 1, team: "India", points: 10 }]));
app.get('/api/cricket/upcoming', (req, res) => res.json([{ id: 1, match: "IND vs PAK", date: "Sunday" }]));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));