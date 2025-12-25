require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const { sendMail } = require("./utils/mailer");

const app = express();

app.use(cors({
  origin: "https://secured-cricket-platform.vercel.app",
  methods: ["GET", "POST"]
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", authRoutes);

/* TEST EMAIL ROUTE */
app.get("/api/test-email", async (req, res) => {
  try {
    await sendMail({
      to: "mpneerajkumar28@gmail.com",
      subject: "Email Test",
      html: "<h3>Email is working 🎉</h3>"
    });
    res.send("EMAIL OK");
  } catch (e) {
    console.error(e);
    res.status(500).send("EMAIL FAILED");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
