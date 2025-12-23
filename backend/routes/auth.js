const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../utils/mailer'); // Ensure this file exists
const router = express.Router();

// Path to database file
const DATA_FILE = path.join(__dirname, '../users.json');

// --- HELPER FUNCTIONS ---

const getUsers = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        return JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (error) { return []; }
};

const saveUsers = (users) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

// --- ROUTES ---

// 1. SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const users = getUsers();

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: Date.now(), name, email, password: hashedPassword };
        
        users.push(newUser);
        saveUsers(users);

        console.log("✅ New User Created:", email);

        // 👇👇 WELCOME EMAIL (Updated Features + Personal Branding) 👇👇
        const subject = "Welcome to Secure Cricket! 🏏 (Built by Neeraj)";
        
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                
                <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">SECURE CRICKET</h1>
                    <p style="color: #a5b4fc; margin-top: 5px; font-size: 14px;">Next-Gen Sports Analytics Platform</p>
                </div>

                <div style="padding: 30px; background-color: #ffffff;">
                    <h2 style="color: #1e293b; margin-top: 0;">Hello, ${name}! 👋</h2>
                    <p style="color: #475569; line-height: 1.6;">
                        Welcome to the future of cricket analytics. I am <strong>Neeraj</strong>, the lead developer, and I am thrilled to have you onboard.
                    </p>
                    <p style="color: #475569; line-height: 1.6;">
                        This platform is designed to give you a premium, data-rich experience. Here are the key features you can explore right now:
                    </p>

                    <div style="margin-top: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        
                        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #ec4899;">
                            <h3 style="margin: 0 0 5px 0; color: #334155; font-size: 16px;">⚡ Real-Time Scores</h3>
                            <p style="margin: 0; font-size: 13px; color: #64748b;">Live match updates, venue details, and commentary.</p>
                        </div>

                        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308;">
                            <h3 style="margin: 0 0 5px 0; color: #334155; font-size: 16px;">📈 Advanced Analytics</h3>
                            <p style="margin: 0; font-size: 13px; color: #64748b;">Interactive run graphs and phase analysis charts.</p>
                        </div>

                        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                            <h3 style="margin: 0 0 5px 0; color: #334155; font-size: 16px;">📰 Trending News</h3>
                            <p style="margin: 0; font-size: 13px; color: #64748b;">Curated stories on tournaments, players, and records.</p>
                        </div>

                        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <h3 style="margin: 0 0 5px 0; color: #334155; font-size: 16px;">👥 Player Profiles</h3>
                            <p style="margin: 0; font-size: 13px; color: #64748b;">Detailed stats and roles for every player on the field.</p>
                        </div>

                    </div>

                    <p style="color: #475569; line-height: 1.6; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        I truly hope you enjoy experiencing this website as much as I enjoyed building it. If you find it useful, <strong>please recommend it to your friends and colleagues!</strong> 🚀
                    </p>

                    <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
                         <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">
                            Login to Dashboard
                        </a>
                    </div>
                </div>

                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        Built with ❤️ by <strong>Neeraj</strong>
                    </p>
                    <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">
                        Stay tuned for more updates!
                    </p>
                </div>
            </div>
        `;
        
        sendEmail(email, subject, html);
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// 2. LOGIN (With Real Email Alert)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: '1h' }
        );

        // Security Alert Email
        const subject = "Security Alert: New Login Detected 🚨";
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ffcccb; border-radius: 10px; background-color: #fff5f5;">
                <h3 style="color: #d32f2f;">New Login Detected</h3>
                <p>Hello ${user.name},</p>
                <p>We noticed a new login to your account at <strong>${new Date().toLocaleString()}</strong>.</p>
                <p>If this was you, you can safely ignore this email.</p>
                <p style="font-size: 12px; color: #555;">Device: Web Browser</p>
            </div>
        `;
        sendEmail(email, subject, html); 

        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// 3. FORGOT PASSWORD (DEPLOYMENT READY)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) return res.status(404).json({ message: "User not found" });

        const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        users[userIndex].resetToken = resetToken;
        users[userIndex].tokenExpiry = Date.now() + 3600000;
        saveUsers(users);

        // 👇 USES ENV VARIABLE FOR DEPLOYMENT URL 👇
        const clientURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${clientURL}/reset-password/${resetToken}`;

        // Reset Password Email
        const subject = "Reset Your Password 🔒";
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #DC2626;">Password Reset Request</h2>
                <p>Click the link below to set a new password:</p>
                <a href="${resetLink}" style="background-color: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
            </div>
        `;
        await sendEmail(email, subject, html);
        
        res.json({ message: "Reset link sent to your email" });
    } catch (error) {
        res.status(500).json({ message: "Error sending email" });
    }
});

// 4. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const users = getUsers();
        const userIndex = users.findIndex(u => u.resetToken === token && u.tokenExpiry > Date.now());

        if (userIndex === -1) return res.status(400).json({ message: "Invalid or expired token" });

        users[userIndex].password = await bcrypt.hash(newPassword, 10);
        delete users[userIndex].resetToken;
        delete users[userIndex].tokenExpiry;
        saveUsers(users);

        res.json({ message: "Password has been reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 5. ADMIN ROUTE: GET ALL USERS (New Feature)
router.get('/admin/all-users', (req, res) => {
    try {
        const users = getUsers();
        
        // SECURITY: Do not send passwords back!
        const safeUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            joinedAt: new Date(user.id).toLocaleString() // ID is based on Date.now()
        }));

        res.json({
            count: safeUsers.length,
            users: safeUsers
        });
    } catch (error) {
        res.status(500).json({ message: "Could not fetch users" });
    }
});

module.exports = router;