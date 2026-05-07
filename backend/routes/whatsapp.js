const router = require('express').Router();
const wa = require('../services/whatsapp');

router.get('/status', (req, res) => {
    res.json(wa.getStatus());
});

module.exports = router;
