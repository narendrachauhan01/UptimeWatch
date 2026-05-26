const router = require('express').Router();
const Server = require('../models/Server');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const { checkAll } = require('../services/monitor');
const auth = require('../middleware/auth');

function userFilter(req) {
    if (req.isAdmin) return {};
    return { userId: req.userId };
}

async function notify(req, message, type) {
    if (req.userId) {
        Notification.create({ userId: req.userId, message, type }).catch(() => {});
    }
}

router.get('/', auth, async (req, res) => {
    try {
        const servers = await Server.find(userFilter(req)).sort('-createdAt');
        res.json(servers);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
    try {
        if (!req.isAdmin) {
            const user = req.user;
            if (!user.isActive) {
                const msg = user.plan === 'free_trial'
                    ? 'Free trial expired. Please upgrade your plan.'
                    : 'Plan expired. Please renew to add more sites.';
                return res.status(403).json({ error: msg, planExpired: true });
            }
            const count = await Server.countDocuments({ userId: req.userId });
            const settings = await Settings.get();
            const planConfig = settings.plans?.[user.plan];
            const limit = planConfig ? planConfig.sites : 2;
            if (count >= limit) {
                return res.status(403).json({
                    error: `Site limit reached (${limit} sites on ${user.plan} plan). Please upgrade.`,
                    limitReached: true, limit, plan: user.plan,
                });
            }
        }
        const data = { ...req.body };
        if (!req.isAdmin) data.userId = req.userId;
        const server = await Server.create(data);
        notify(req, `Site "${server.name}" added successfully`, 'site_added');
        res.json(server);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const filter = { _id: req.params.id, ...userFilter(req) };
        const server = await Server.findOneAndUpdate(filter, req.body, { returnDocument: 'after' });
        if (!server) return res.status(404).json({ error: 'Server not found' });
        notify(req, `Site "${server.name}" updated successfully`, 'site_updated');
        res.json(server);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const filter = { _id: req.params.id, ...userFilter(req) };
        const server = await Server.findOneAndDelete(filter);
        if (!server) return res.status(404).json({ error: 'Not found' });
        notify(req, `Site "${server.name}" was deleted`, 'site_deleted');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/check-now', auth, async (req, res) => {
    try {
        await checkAll();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/history', auth, async (req, res) => {
    try {
        const filter = { _id: req.params.id, ...userFilter(req) };
        const server = await Server.findOne(filter).select('name history');
        if (!server) return res.status(404).json({ error: 'Not found' });
        res.json(server);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
