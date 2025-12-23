require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

// 👇 Imports from your other files
const { sendEmail } = require('./mailer'); 
const cricketRoutes = require('./cricket'); 

const app = express();
app.use(express.json());
app.use(cors());

// 1. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Connection Error:', err));

// 2. User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiry: Date
});
const User = mongoose.model('User', userSchema);

// --- ROUTES SETUP ---

// 3. Connect Cricket Data Routes
app.use('/api/cricket', cricketRoutes);

// 4. SIGNUP Route (Integrated with mailer.js)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: "User exists" });

        user = new User({ username, email, password });
        await user.save();
        console.log("✅ User Registered:", email);

        // Send Welcome Email
        const welcomeContent = `
            <div style="font-family: Arial; padding: 20px; background: #f9fafb; border-radius: 10px;">
                <h2 style="color: #1e1b4b;">Welcome to Secure Cricket, ${username}! 🏏</h2>
                <p>Built with ❤️ by <b>Neeraj</b>. Your premium dashboard is live.</p>
                <a href="https://secured-cricket-platform.vercel.app/login" style="display:inline-block; background:#4f46e5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Login Now</a>
            </div>`;
        
        await sendEmail(email, 'Welcome to Secure Cricket! 🏏', welcomeContent);

        res.status(201).json({ success: true, message: "Signup Success!" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// 5. LOGIN Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(400).json({ success: false, message: "Invalid Credentials" });

        res.json({ success: true, user: { id: user._id, name: user.username, email: user.email } });
    } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

// 6. FORGOT PASSWORD (Using mailer.js)
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetLink = `https://secured-cricket-platform.vercel.app/reset-password/${token}`;
        const resetHtml = `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset it.</p>`;
        
        await sendEmail(email, 'Password Reset Request 🔒', resetHtml);

        res.json({ success: true, message: "Reset link sent!" });
    } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));