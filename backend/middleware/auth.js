const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function authMiddleware(req, res, next) {
    const token = req.cookies?.sm_token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.username) {
            // Admin token (existing system)
            req.isAdmin = true;
            return next();
        }

        if (decoded.userId) {
            const user = await User.findById(decoded.userId);
            if (!user) return res.status(401).json({ error: 'User not found' });
            if (user.isBlocked) return res.status(403).json({ error: 'Account blocked. Contact support.' });
            req.user   = user;
            req.userId = user._id;

            // Block write operations if plan expired
            if (['POST','PUT','DELETE','PATCH'].includes(req.method)) {
                const expired =
                    (user.plan === 'free_trial' && user.trialVerified && user.trialEndsAt && new Date() > new Date(user.trialEndsAt)) ||
                    (user.plan !== 'free_trial' && user.planEndsAt && new Date() > new Date(user.planEndsAt));
                // Allow payment routes always
                const allowedPaths = ['/api/payment', '/api/users/logout', '/api/users/profile'];
                const isAllowed = allowedPaths.some(p => req.path.startsWith(p));
                if (expired && !isAllowed) {
                    return res.status(403).json({ error: 'Plan expired. Upgrade to continue.', planExpired: true });
                }
            }

            return next();
        }

        return res.status(401).json({ error: 'Invalid token' });
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
