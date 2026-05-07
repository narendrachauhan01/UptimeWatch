const router = require('express').Router();
const Recipient = require('../models/Recipient');

router.get('/', async (req, res) => {
    const recipients = await Recipient.find().sort('-createdAt');
    res.json(recipients);
});

router.post('/', async (req, res) => {
    try {
        const r = await Recipient.create(req.body);
        res.json(r);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.put('/:id', async (req, res) => {
    const r = await Recipient.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(r);
});

router.delete('/:id', async (req, res) => {
    await Recipient.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

module.exports = router;
