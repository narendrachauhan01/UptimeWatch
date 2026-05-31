const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(auth);

router.get('/',     ctrl.getNotifications);
router.put('/read',    ctrl.markRead);
router.delete('/clear', async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        await Notification.deleteMany({ userId: req.userId });
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
// handled inline above
