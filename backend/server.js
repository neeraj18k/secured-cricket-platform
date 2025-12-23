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

// 2. Email Transporter (Credentials from Render Env)
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

// 4. SIGNUP Route (Handles both 'name' and 'username' from Frontend)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, name, email, password } = req.body; 

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: "User already exists" });

        // FIX: Mapping frontend field to backend schema
        const finalUsername = username || name || "User";

        user = new User({ 
            username: finalUsername, 
            email, 
            password 
        });
        
        await user.save();

        // Welcome Email Content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Secure Cricket! 🏏 (Built by Neeraj)',
            html: `
                <div style="font-family: Arial; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #1e1b4b; padding: 20px; text-align: center; color: white;">
                        <h1>SECURE CRICKET</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2>Hello, ${finalUsername}! 👋</h2>
                        <p>Welcome! I am <b>Neeraj</b>, the lead developer. Thrilled to have you onboard.</p>
                        <p>Explore real-time scores and analytics from your dashboard.</p>
                    </div>
                    <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                        Built with ❤️ by Neeraj
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

// 5. LOGIN Route (Dashboard Property Fix)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        // Sending 'name' so Dashboard.jsx doesn't crash
        res.json({ 
            success: true, 
            user: { 
                id: user._id, 
                name: user.username, 
                email: user.email 
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 6. Cricket Data Routes (Preventing Dashboard 404s)
app.get('/api/cricket/match-status', (req, res) => res.json({ 
    match: "Live Match", venue: "Stadium", homeTeam: { name: "Team A", score: "0/0", overs: 0 },
    stats: { projected: 0, winProb: "50%", crr: 0, partnership: "0" } 
}));
app.get('/api/cricket/analytics', (req, res) => res.json({ recentOvers: [], runProgression: [], phaseAnalysis: [], commentary: [] }));
app.get('/api/cricket/news', (req, res) => res.json([]));
app.get('/api/cricket/players', (req, res) => res.json([]));
app.get('/api/cricket/standings', (req, res) => res.json([]));
app.get('/api/cricket/upcoming', (req, res) => res.json([]));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));