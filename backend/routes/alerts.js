const router = require('express').Router();
const Alert = require('../models/Alert');
const Server = require('../models/Server');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        let filter = {};
        if (!req.isAdmin) {
            const userServers = await Server.find({ userId: req.userId }, '_id');
            const serverIds = userServers.map(s => s._id);
            filter = { server: { $in: serverIds } };
        }
        const alerts = await Alert.find(filter).sort('-createdAt').limit(100);
        res.json(alerts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
