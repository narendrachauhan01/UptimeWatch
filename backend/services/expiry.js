const tls = require('tls');
const https = require('https');

function checkSSL(hostname) {
    return new Promise((resolve) => {
        const options = { host: hostname, port: 443, rejectUnauthorized: false, timeout: 10000 };
        const socket = tls.connect(options, () => {
            try {
                const cert = socket.getPeerCertificate();
                socket.destroy();
                if (!cert || !cert.valid_to) return resolve(null);
                const expiry = new Date(cert.valid_to);
                const daysLeft = Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24));
                const issuer = cert.issuer?.O || null;
                resolve({ expiry, daysLeft, issuer });
            } catch (_) { resolve(null); }
        });
        socket.on('error', () => resolve(null));
        socket.on('timeout', () => { socket.destroy(); resolve(null); });
    });
}

function checkDomain(rootDomain) {
    return new Promise((resolve) => {
        const url = `https://api.whois.vu/?q=${encodeURIComponent(rootDomain)}`;
        const req = https.get(url, { timeout: 15000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.expires) {
                        const expiry = new Date(json.expires * 1000);
                        const daysLeft = Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24));
                        return resolve({
                            expiry,
                            daysLeft,
                            registrar: json.registrar || null,
                            available: json.available === 'no' ? false : true,
                        });
                    }
                    resolve(null);
                } catch (_) { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

function extractHostname(url) {
    try {
        return new URL(url).hostname;
    } catch (_) { return null; }
}

function extractRootDomain(hostname) {
    // e.g. maintenance.kandbnetservice.in → kandbnetservice.in
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    return parts.slice(-2).join('.');
}

module.exports = { checkSSL, checkDomain, extractHostname, extractRootDomain };
