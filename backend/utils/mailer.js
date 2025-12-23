const nodemailer = require('nodemailer');
require('dotenv').config(); // 👈 Load .env variables

// 1. Create the Transporter (The Postman)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // 👇 SECURITY FIX: Read from .env file
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// 2. The Send Function
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"Secure Cricket Admin" <${process.env.EMAIL_USER}>`, // 👈 Uses env variable
            to: to,
            subject: subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent: " + info.response);
        return true;
    } catch (error) {
        console.error("❌ Email failed:", error);
        return false;
    }
};

module.exports = { sendEmail };