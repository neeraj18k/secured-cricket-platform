require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

// 👇 Imports from your other files
const { sendEmail } = require('./utils/mailer'); 
const cricketRoutes = require('./routes/cricket'); 

const app = express();
app.use(express.json());
app.use(cors());

// 1. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Connection Error:', err));

// 2. User Schema (Added reset token fields for Forgot Password)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiry: Date
});
const User = mongoose.model('User', userSchema);

// --- ROUTES SETUP ---

// 3. Connect Cricket Data Routes (from cricket.js)
app.use('/api/cricket', cricketRoutes);

// 4. SIGNUP Route (Using mailer.js)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: "User already exists" });

        user = new User({ username, email, password });
        await user.save();
        console.log("✅ User Registered:", email);

        // Welcome Email Content
        const welcomeContent = `
            <div style="font-family: Arial; padding: 20px; background: #f0f4ff; border-radius: 10px; border: 1px solid #4f46e5;">
                <h2 style="color: #1e1b4b;">Welcome to Secure Cricket, ${username}! 🏏</h2>
                <p>Built with ❤️ by <b>Neeraj</b>. Your premium dashboard is now live.</p>
                <p>Explore real-time stats and historic records.</p>
                <a href="https://secured-cricket-platform.vercel.app/login" style="display:inline-block; background:#4f46e5; color:white; padding:12px 24px; text-decoration:none; border-radius:25px; font-weight:bold;">Login Now</a>
            </div>`;
        
        // Calling mailer.js function
        await sendEmail(email, 'Welcome to Secure Cricket! 🏏', welcomeContent);

        res.status(201).json({ success: true, message: "Signup Success! Check your email." });
    } catch (err) { 
        console.log("🔥 Signup Error:", err.message);
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// 5. LOGIN Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(400).json({ success: false, message: "Invalid Credentials" });

        res.json({ 
            success: true, 
            user: { id: user._id, name: user.username, email: user.email } 
        });
    } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

// 6. FORGOT PASSWORD (Using mailer.js)
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Create secure reset token
        const token = crypto.randomBytes(20).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // Expires in 1 hour
        await user.save();

        const resetLink = `https://secured-cricket-platform.vercel.app/reset-password/${token}`;
        const resetHtml = `
            <div style="font-family: Arial; padding: 20px;">
                <h3>Password Reset Request 🔒</h3>
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <a href="${resetLink}" style="color: #4f46e5; font-weight: bold;">Reset My Password</a>
                <p>This link will expire in 1 hour.</p>
            </div>`;
        
        await sendEmail(email, 'Password Reset Request 🔒', resetHtml);

        res.json({ success: true, message: "Reset link sent to your email!" });
    } catch (err) { 
        console.log("🔥 Forgot Pass Error:", err.message);
        res.status(500).json({ success: false, message: "Server Error" }); 
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));