const router = require('express').Router();
const Alert = require('../models/Alert');

router.get('/', async (req, res) => {
    const alerts = await Alert.find().sort('-createdAt').limit(100);
    res.json(alerts);
});

module.exports = router;
