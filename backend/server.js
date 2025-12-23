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

// 2. Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use 16-digit App Password here
    }
});

// 3. User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- ORIGINAL DASHBOARD DATA (Static) ---

const newsData = [
    { id: 1, title: "Virat Kohli's Masterclass leads India to victory", type: "HOT", time: "5 mins ago", img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400", details: "A brilliant century from Kohli secured the win against Australia in the final over." },
    { id: 2, title: "IPL 2024: New records broken in the powerplay", type: "TRENDING", time: "1 hour ago", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400", details: "Teams are scoring faster than ever this season, with average scores crossing 200." }
];

const playersData = [
    { id: 1, name: "Virat Kohli", role: "Top Order Batsman", stats: { runs: 82, balls: 53 }, img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=100" },
    { id: 2, name: "Jasprit Bumrah", role: "Lead Pacer", stats: { wickets: 3, economy: 4.5 }, img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100" }
];

// --- ROUTES ---

// 4. SIGNUP Route (With Welcome Email)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: "User already exists" });

        const finalUsername = username || name || "User";
        user = new User({ username: finalUsername, email, password });
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Secure Cricket! 🏏 (Built by Neeraj)',
            html: `
                <div style="font-family: Arial; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #1e1b4b;">Hello, ${finalUsername}! 👋</h2>
                    <p>Welcome to the platform. I am <b>Neeraj</b>, the lead developer.</p>
                    <p>Your premium cricket analytics dashboard is now ready.</p>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://secured-cricket-platform.vercel.app/login" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px;">Login Now</a>
                    </div>
                </div>`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) console.log("📧 Email Error:", error);
            else console.log("📧 Email Sent to:", email);
        });

        res.status(201).json({ success: true, message: "User registered!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. LOGIN Route (Dashboard Fix)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        res.json({ 
            success: true, 
            user: { id: user._id, name: user.username, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 6. ORIGINAL DASHBOARD ROUTES (Restoring Data)
app.get('/api/cricket/match-status', (req, res) => {
    res.json({
        match: "IND vs AUS - T20 Series",
        venue: "Melbourne Cricket Ground",
        homeTeam: { name: "India", score: "192/3", overs: 19.1 },
        stats: { projected: "205", winProb: "85%", crr: "10.05", partnership: "74 (32)" }
    });
});

app.get('/api/cricket/analytics', (req, res) => {
    res.json({
        recentOvers: [{score: "4", type: "boundary"}, {score: "1", type: "single"}, {score: "6", type: "six"}, {score: "W", type: "wicket"}],
        runProgression: [{over: 1, runs: 12}, {over: 5, runs: 48}, {over: 10, runs: 95}, {over: 15, runs: 152}],
        phaseAnalysis: [{name: "Powerplay", runs: 58}, {name: "Middle", runs: 94}, {name: "Death", runs: 40}],
        commentary: [{over: "19.1", text: "SIX! Absolute monster from Jasprit Bumrah over long-on!"}]
    });
});

app.get('/api/cricket/news', (req, res) => res.json(newsData));
app.get('/api/cricket/players', (req, res) => res.json(playersData));
app.get('/api/cricket/standings', (req, res) => res.json([
    { rank: 1, team: "India", played: 5, won: 5, points: 10 },
    { rank: 2, team: "Australia", played: 5, won: 3, points: 6 }
]));
app.get('/api/cricket/upcoming', (req, res) => res.json([
    { id: 1, match: "IND vs PAK", date: "Sunday, 7:30 PM", venue: "New York" }
]));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));