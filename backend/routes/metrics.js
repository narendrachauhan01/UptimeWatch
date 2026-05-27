const router = require('express').Router();
const ServerMetric = require('../models/ServerMetric');
const Server = require('../models/Server');
const auth = require('../middleware/auth');

// API Key middleware
function authAgent(req, res, next) {
    const key = req.headers['x-agent-key'];
    if (!key || key !== process.env.AGENT_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized — invalid agent key' });
    }
    next();
}

// POST /api/metrics — agent sends metrics
router.post('/', authAgent, async (req, res) => {
    try {
        const { serverId, serverName, hostname, platform, cpu,
                ramUsed, ramTotal, diskUsed, diskTotal,
                swapUsed, swapTotal, load1, load5, load15,
                uptime, uptimeStr, users, cpuCores, cpuModel, cpuArch, cpuTemp,
                localIp, publicIp, networkRoutes, activeSessions, lastSsh } = req.body;
        if (!serverId || !serverName) return res.status(400).json({ error: 'serverId and serverName required' });

        await ServerMetric.create({
            serverId, serverName, hostname, platform, cpu, cpuTemp,
            ramUsed, ramTotal, diskUsed, diskTotal,
            swapUsed, swapTotal, load1, load5, load15,
            uptime, uptimeStr, users, cpuCores, cpuModel, cpuArch,
            localIp, publicIp, networkRoutes, activeSessions, lastSsh,
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/metrics/latest — latest metrics for caller's servers only
router.get('/latest', auth, async (req, res) => {
    try {
        let serverIds = null;
        if (!req.isAdmin) {
            const userServers = await Server.find({ userId: req.userId }, '_id');
            serverIds = userServers.map(s => s._id.toString());
        }
        let pipeline = [
            { $sort: { timestamp: -1 } },
            { $group: { _id: '$serverId', latest: { $first: '$$ROOT' } } },
            { $replaceRoot: { newRoot: '$latest' } },
        ];
        if (serverIds !== null) {
            pipeline.unshift({ $match: { serverId: { $in: serverIds } } });
        }
        const servers = await ServerMetric.aggregate(pipeline);
        res.json(servers);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/metrics/:serverId/history — last 1 hour history (own servers only)
router.get('/:serverId/history', auth, async (req, res) => {
    try {
        if (!req.isAdmin) {
            const server = await Server.findOne({ _id: req.params.serverId, userId: req.userId }, '_id');
            if (!server) return res.status(404).json({ error: 'Not found' });
        }
        const since = new Date(Date.now() - 60 * 60 * 1000);
        const metrics = await ServerMetric.find({
            serverId: req.params.serverId,
            timestamp: { $gte: since },
        }).sort({ timestamp: 1 }).limit(120);
        res.json(metrics);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
