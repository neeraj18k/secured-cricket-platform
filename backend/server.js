require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();

// 🛠️ 1. Bulletproof CORS Setup
// Isse Vercel aur Render ke beech ka connection stagnant nahi hoga
app.use(cors({
    origin: 'https://secured-cricket-platform.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// 2. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Connection Error:', err));

// 3. User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiry: Date
});
const User = mongoose.model('User', userSchema);

// 4. Email Transporter (Verified Gmail Config)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- AUTH ROUTES ---

// 5. SIGNUP with Enhanced Debugging & Premium Template
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(`📩 Signup attempt: ${email}`);

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: "User already exists" });

        user = new User({ username, email, password });
        await user.save();
        console.log("👤 User saved to DB");

        const welcomeHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #1e1b4b; padding: 20px; text-align: left;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Hello, ${username}! 👋</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
                <p style="color: #4a5568; line-height: 1.6;">Welcome to the future of cricket analytics. I am <b>Neeraj</b>, the lead developer.</p>
                <div style="border-left: 4px solid #ec4899; background: #fdf2f8; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
                    <strong style="color: #1e1b4b;">⚡ Real-Time Scores</strong>
                </div>
                <div style="border-left: 4px solid #eab308; background: #fefce8; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
                    <strong style="color: #1e1b4b;">📈 Advanced Analytics</strong>
                </div>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="https://secured-cricket-platform.vercel.app/login" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                </div>
            </div>
        </div>`;

        // 🔥 Await is mandatory here
        await transporter.sendMail({
            from: `"Secure Cricket Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to the Future of Cricket Analytics! 🏏',
            html: welcomeHtml
        });
        console.log("📧 Welcome email sent");

        res.status(201).json({ success: true, message: "Signup Success! Check email." });
    } catch (err) { 
        console.error("🔥 Signup Error:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error" }); 
    }
});

// 6. FORGOT PASSWORD
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; 
        await user.save();

        const resetLink = `https://secured-cricket-platform.vercel.app/reset-password/${token}`;
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Password - Secure Cricket 🔒',
            html: `<h3>Reset Request</h3><p>Click <a href="${resetLink}">here</a> to reset password. Link expires in 1 hour.</p>`
        });

        res.json({ success: true, message: "Reset link sent!" });
    } catch (err) { res.status(500).json({ success: false, message: "Error sending email" }); }
});

// 7. RESET PASSWORD
app.post('/api/auth/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findOne({ 
            resetToken: req.params.token, 
            resetTokenExpiry: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

        user.password = password; 
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ success: true, message: "Password updated!" });
    } catch (err) { res.status(500).json({ success: false, message: "Reset failed" }); }
});

// 8. LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ success: false, message: "Invalid Credentials" });
        res.json({ success: true, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) { res.status(500).json({ success: false, message: "Login error" }); }
});

// 9. CRICKET DATA
app.get('/api/cricket/match-status', (req, res) => {
    res.json({
        match: "IND vs AUS",
        venue: "Narendra Modi Stadium",
        homeTeam: { name: "India", score: "324/4", overs: "48.2" },
        stats: { projected: "355", winProb: "88%", crr: "6.72" }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));