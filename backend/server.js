require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Database se connect karne ka code
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB se connection kamyab raha!'))
  .catch(err => console.error('❌ Database connection mein error:', err));
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit'); // 👈 1. IMPORT THIS
const authRoutes = require('./routes/auth');
const cricketRoutes = require('./routes/cricket');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 👇👇 2. ADD THIS SECURITY RULE 👇👇
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: { message: "Too many login attempts. Please try again after 15 minutes." },
    standardHeaders: true, 
    legacyHeaders: false,
});

// Apply limiter ONLY to the login route
app.use('/api/auth/login', loginLimiter); 
// 👆👆 END OF SECURITY RULE 👆👆

app.use('/api/auth', authRoutes);
app.use('/api/cricket', cricketRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));