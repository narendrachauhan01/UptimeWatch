const router = require('express').Router();
const { exec } = require('child_process');
const net = require('net');

// TCP ping — connects to port 80/443 and measures latency (no root needed)
function tcpPing(host, port = 80) {
    return new Promise((resolve) => {
        const start = Date.now();
        const sock = new net.Socket();
        sock.setTimeout(5000);
        sock.connect(port, host, () => {
            const ms = Date.now() - start;
            sock.destroy();
            resolve({ alive: true, ms });
        });
        sock.on('error', () => { sock.destroy(); resolve({ alive: false, ms: null }); });
        sock.on('timeout', () => { sock.destroy(); resolve({ alive: false, ms: null }); });
    });
}

// Try specified port, fallback logic only if no port given
async function pingHost(hostname, port) {
    if (port && port !== 80 && port !== 443) {
        return await tcpPing(hostname, port);
    }
    let result = await tcpPing(hostname, port || 443);
    if (!result.alive && (!port || port === 443)) result = await tcpPing(hostname, 80);
    return result;
}

function extractHost(input) {
    try {
        if (!input.startsWith('http')) input = 'https://' + input;
        return new URL(input).hostname;
    } catch {
        return input.trim();
    }
}

// POST /api/ping — single ping check (auth optional, rate-limit by IP is enough)
router.post('/', async (req, res) => {
    const { target, port } = req.body;
    if (!target) return res.status(400).json({ error: 'target required' });
    const hostname = extractHost(target);
    if (!hostname) return res.status(400).json({ error: 'Invalid target' });
    try {
        const result = await pingHost(hostname, port ? Number(port) : null);
        res.json({ hostname, port: port || null, ...result, time: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
