const router = require('express').Router();
const Recipient = require('../models/Recipient');
const auth = require('../middleware/auth');

// Admin sees all (userId: null), user sees only their own
function userFilter(req) {
    if (req.isAdmin) return {};
    return { userId: req.userId };
}

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const recipients = await Recipient.find(userFilter(req)).sort('-createdAt').populate('servers', 'name status');
        res.json(recipients);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        if (!req.isAdmin) data.userId = req.userId;
        const r = await Recipient.create(data);
        res.json(r);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const filter = { _id: req.params.id, ...userFilter(req) };
        const r = await Recipient.findOneAndUpdate(filter, req.body, { new: true });
        if (!r) return res.status(404).json({ error: 'Not found' });
        res.json(r);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const filter = { _id: req.params.id, ...userFilter(req) };
        const r = await Recipient.findOneAndDelete(filter);
        if (!r) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
