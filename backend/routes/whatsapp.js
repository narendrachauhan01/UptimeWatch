const router = require('express').Router();
const wa     = require('../services/whatsapp');
const auth   = require('../middleware/auth');

// Status + instance state
router.get('/status', auth, async (req, res) => {
    const base  = wa.getStatus();
    const state = await wa.getInstanceState();
    res.json({ ...base, instanceState: state?.stateInstance || null });
});

module.exports = router;
