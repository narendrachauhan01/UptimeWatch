const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Settings = require('../models/Settings');
const PendingRegistration = require('../models/PendingRegistration');
const auth = require('../middleware/auth');
const { sendEmail, otpEmailHtml } = require('../services/email');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function genOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function userPayload(u) {
    return {
        id: u._id,
        name: u.name,
        email: u.email,
        plan: u.plan,
        trialEndsAt: u.trialEndsAt,
        planEndsAt: u.planEndsAt,
        siteLimit: u.siteLimit,
        isActive: u.isActive,
        trialDaysLeft: u.trialDaysLeft,
        isBlocked: u.isBlocked,
        // existing users (no field) default to verified; new users default to false
        trialVerified: u.trialVerified ?? true,
    };
}

// ── Step 1: send OTP for registration ──────────────────────────────────────
router.post('/register/send-otp', async (req, res) => {
    try {
        const { name, email, password, phone, address, city, state, country } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ error: 'Email already registered. Please login.' });

        const otp = genOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await PendingRegistration.findOneAndUpdate(
            { email: email.toLowerCase() },
            { name, email: email.toLowerCase(), phone: phone || null, address: address || null, city: city || null, state: state || null, country: country || null, password, otp, otpExpiry, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await sendEmail(email, 'Verify your email — ServerMonitor', otpEmailHtml(name, otp));
        res.json({ message: 'OTP sent to your email' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Step 2: verify OTP and create account ──────────────────────────────────
router.post('/register/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

        const pending = await PendingRegistration.findOne({ email: email.toLowerCase() });
        if (!pending) return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
        if (new Date() > pending.otpExpiry) return res.status(400).json({ error: 'OTP expired. Request a new one.' });
        if (pending.otp !== otp) return res.status(400).json({ error: 'Invalid OTP. Please try again.' });

        // Check again in case user registered from another tab
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ error: 'Email already registered.' });

        const settings = await Settings.get();
        const trialEndsAt = new Date(Date.now() + settings.trialDays * 24 * 60 * 60 * 1000);
        const user = await User.create({ name: pending.name, email: pending.email, phone: pending.phone, address: pending.address, city: pending.city, state: pending.state, country: pending.country, password: pending.password, trialEndsAt });

        await PendingRegistration.deleteOne({ email: email.toLowerCase() });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: userPayload(user) });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// ── Password login ──────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (user.isBlocked) return res.status(403).json({ error: 'Account blocked. Contact support.' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: userPayload(user) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Google OAuth ─────────────────────────────────────────────────────────────
router.post('/google-auth', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ error: 'Google credential required' });
        if (!process.env.GOOGLE_CLIENT_ID) return res.status(500).json({ error: 'Google Sign-In not configured' });

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { name, email, sub: googleId } = payload;

        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            if (user.isBlocked) return res.status(403).json({ error: 'Account blocked. Contact support.' });
            if (!user.googleId) { user.googleId = googleId; await user.save(); }
        } else {
            const settings = await Settings.get();
            const trialEndsAt = new Date(Date.now() + settings.trialDays * 24 * 60 * 60 * 1000);
            user = await User.create({
                name, email: email.toLowerCase(), googleId,
                trialEndsAt, trialVerified: true,
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: userPayload(user) });
    } catch (e) {
        res.status(400).json({ error: 'Google Sign-In failed: ' + e.message });
    }
});

// ── change password ──────────────────────────────────────────────────────────
router.put('/change-password', auth, async (req, res) => {
    try {
        if (req.isAdmin) return res.status(400).json({ error: 'Admin password cannot be changed here' });
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both current and new password required' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const match = await user.comparePassword(currentPassword);
        if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── /me ─────────────────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
    if (req.isAdmin) return res.json({ isAdmin: true, name: 'Admin', plan: 'admin', siteLimit: 9999, isActive: true });
    const settings = await Settings.get();
    const u = req.user;
    const planConfig = settings.plans?.[u.plan];
    const dynamicLimit = planConfig ? planConfig.sites : 2;
    res.json({ ...userPayload(u), siteLimit: dynamicLimit });
});

module.exports = router;
