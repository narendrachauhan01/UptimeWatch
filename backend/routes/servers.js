const router = require('express').Router();
const Server = require('../models/Server');
const { checkAll } = require('../services/monitor');

router.get('/', async (req, res) => {
    const servers = await Server.find().sort('-createdAt');
    res.json(servers);
});

router.post('/', async (req, res) => {
    try {
        const server = await Server.create(req.body);
        res.json(server);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.put('/:id', async (req, res) => {
    const server = await Server.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(server);
});

router.delete('/:id', async (req, res) => {
    await Server.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

router.post('/check-now', async (req, res) => {
    await checkAll();
    res.json({ success: true });
});

router.get('/:id/history', async (req, res) => {
    const server = await Server.findById(req.params.id).select('name history');
    res.json(server);
});

module.exports = router;
