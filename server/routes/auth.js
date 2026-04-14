const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const client = new OAuth2Client("159470189945-22qhufleo38vsskqvlthslt949piknlh.apps.googleusercontent.com");

// Signup
router.post('/signup', async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({ message: 'User registered successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
  { id: user._id, email: user.email, name: user.name, avatar: user.avatar },
  'secretkey',
  { expiresIn: '1h' }
);

        res.json({ token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "159470189945-22qhufleo38vsskqvlthslt949piknlh.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: "google-auth", // dummy
        avatar: picture
      });
      await user.save();
    } else if (!user.avatar && picture) {
      user.avatar = picture;
      await user.save();
    }

    const jwtToken = jwt.sign(
  { 
    id: user._id, 
    name: user.name,
    email: user.email,
    avatar: user.avatar
  },
  "secretkey",
  { expiresIn: "7d" }
);

    res.json({ token: jwtToken });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OTP In-Memory Store
global.otpStore = {};

let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    console.warn("Nodemailer not installed. Fallback to console OTP logging.");
}

const getTransporter = async () => {
    if (!nodemailer) return null;
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user, // ethereal generated
            pass: testAccount.pass, // ethereal generated
        }
    });
};

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        global.otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };

        if (nodemailer) {
            const transporter = await getTransporter();
            try {
                const info = await transporter.sendMail({
                    from: '"Vidora Support" <support@vidora.com>',
                    to: email,
                    subject: 'Vidora Password Reset OTP',
                    text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
                    html: `<h3>Vidora Password Reset</h3><p>Your OTP is: <b>${otp}</b></p><p>It expires in 10 minutes.</p>`
                });
                console.log(`Email sent successfully to ${email}`);
                console.log(`[ETHEREAL INBOX URL] Preview simulated Email: ${nodemailer.getTestMessageUrl(info)}`);
            } catch (err) {
                console.log(`Failed to send email. Check credentials. OTP for ${email} is: ${otp}`);
            }
        } else {
            console.log(`[DEV-MODE] Nodemailer missing. OTP for ${email} is: ${otp}`);
        }

        res.json({ message: 'OTP sent successfully. Check your email or console.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const store = global.otpStore[email];
        
        if (!store || store.otp !== otp || store.expires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        
        delete global.otpStore[email];

        res.json({ message: 'Password reset successfully. You can now login.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;