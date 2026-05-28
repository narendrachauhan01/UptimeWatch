const router = require('express').Router();
const Integration = require('../models/Integration');
const auth = require('../middleware/auth');

router.use(auth);

// GET all user's integrations
router.get('/', async (req, res) => {
    try {
        const list = await Integration.find({ userId: req.userId });
        res.json(list);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST save/update an integration
router.post('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { config, events, active } = req.body;
        const doc = await Integration.findOneAndUpdate(
            { userId: req.userId, type },
            { config, events: events || 'all', active: active !== false },
            { upsert: true, new: true }
        );
        res.json(doc);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE an integration
router.delete('/:type', async (req, res) => {
    try {
        await Integration.deleteOne({ userId: req.userId, type: req.params.type });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
