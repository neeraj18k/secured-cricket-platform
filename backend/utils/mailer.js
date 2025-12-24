const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER ? "LOADED" : "NOT LOADED");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "LOADED" : "NOT LOADED");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true,
  debug: true
});

module.exports = transporter;
