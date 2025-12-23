require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

const { sendEmail } = require('./utils/mailer'); 
const cricketRoutes = require('./routes/cricket'); 

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Connection Error:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiry: Date
});
const User = mongoose.model('User', userSchema);

app.use('/api/cricket', cricketRoutes);

// 4. SIGNUP Route (FIXED WITH AWAIT)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: "User exists" });

        user = new User({ username, email, password });
        await user.save();
        console.log("✅ User Saved:", email);

        const welcomeContent = `<h3>Welcome ${username}! Built by Neeraj.</h3>`;
        
        // 👇 AWAIT LAGANA ZAROORI HAI
        console.log("📧 Sending Email...");
        const emailSent = await sendEmail(email, 'Welcome to Secure Cricket! 🏏', welcomeContent);
        
        if(emailSent) console.log("✅ Email successfully triggered from Signup");
        else console.log("❌ Email failed to trigger from Signup");

        res.status(201).json({ success: true, message: "Signup Success!" });
    } catch (err) { 
        console.log("🔥 Signup Error:", err.message);
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// 6. FORGOT PASSWORD (FIXED WITH AWAIT)
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
        const resetHtml = `<p>Reset link: <a href="${resetLink}">Click here</a></p>`;
        
        // 👇 AWAIT LAGANA ZAROORI HAI
        console.log("📧 Sending Reset Email...");
        await sendEmail(email, 'Password Reset Request 🔒', resetHtml);

        res.json({ success: true, message: "Reset link sent!" });
    } catch (err) { 
        res.status(500).json({ success: false, message: "Server Error" }); 
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));