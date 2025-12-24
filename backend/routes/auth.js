const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const transporter = require("../utils/mailer");

const router = express.Router();

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // ❌ NO EMAIL HERE (industry standard)
    res.status(201).json({ success: true, message: "Signup successful" });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // ⭐ WELCOME MAIL ONLY ON FIRST LOGIN
    if (user.firstLogin) {
      await transporter.sendMail({
        from: `"Secure Cricket" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Welcome to Secure Cricket 🏏",
        html: `
          <h2>Welcome ${user.username} 👋</h2>
          <p>Your account is now active.</p>
          <p>Enjoy live scores, analytics & insights.</p>
        `
      });

      user.firstLogin = false;
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetLink = `https://secured-cricket-platform.vercel.app/reset-password/${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Reset Password 🔐",
      html: `
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>Link valid for 1 hour.</p>
      `
    });

    res.json({ success: true, message: "Reset link sent" });
  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ message: "Reset failed" });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Reset failed" });
  }
});

module.exports = router;
