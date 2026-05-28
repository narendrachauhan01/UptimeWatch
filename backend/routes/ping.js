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

// Try HTTPS first (443), fallback to HTTP (80)
async function pingHost(hostname) {
    let result = await tcpPing(hostname, 443);
    if (!result.alive) result = await tcpPing(hostname, 80);
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
    const { target } = req.body;
    if (!target) return res.status(400).json({ error: 'target required' });
    const hostname = extractHost(target);
    if (!hostname) return res.status(400).json({ error: 'Invalid target' });
    try {
        const result = await pingHost(hostname);
        res.json({ hostname, ...result, time: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
