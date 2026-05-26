/**
 * WhatsApp Service — Green API (https://green-api.com)
 * OPTIONAL: if GREEN_API_INSTANCE + GREEN_API_TOKEN not set in .env,
 * WhatsApp alerts are silently skipped. App runs normally without it.
 *
 * Hot-reload: watches .env file — new credentials are auto-detected,
 * no backend restart required.
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const dotenv = require('dotenv');

const ENV_PATH = path.resolve(__dirname, '../.env');

// Re-read .env into process.env (override existing values)
function reloadEnv() {
    try {
        dotenv.config({ path: ENV_PATH, override: true });
    } catch (_) {}
}

// Watch .env file — reload when saved
let watchDebounce = null;
fs.watch(ENV_PATH, () => {
    clearTimeout(watchDebounce);
    watchDebounce = setTimeout(() => {
        const wasBefore = isConfigured();
        reloadEnv();
        const isNow = isConfigured();
        if (!wasBefore && isNow) {
            console.log(`[WhatsApp] ✅ Credentials detected — Green API enabled (instance ${process.env.GREEN_API_INSTANCE})`);
        } else if (wasBefore && !isNow) {
            console.log('[WhatsApp] ⚠️  Credentials removed — WhatsApp alerts disabled');
        }
    }, 500);
});

// ─────────────────────────────────────────────────────────────
function isConfigured() {
    return !!(process.env.GREEN_API_INSTANCE && process.env.GREEN_API_TOKEN);
}

function formatPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}@c.us`;
    if (digits.length === 12 && digits.startsWith('91')) return `${digits}@c.us`;
    return `${digits}@c.us`;
}

function httpPost(url, body) {
    return new Promise((resolve, reject) => {
        const u       = new URL(url);
        const payload = JSON.stringify(body);
        const req     = https.request({
            hostname: u.hostname,
            path:     u.pathname,
            method:   'POST',
            headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({ raw: data }); } });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function sendMessage(phone, message) {
    if (!isConfigured()) {
        console.log('[WhatsApp] Not configured — skipping alert');
        return;
    }
    const { GREEN_API_INSTANCE: id, GREEN_API_TOKEN: token } = process.env;
    const url    = `https://api.green-api.com/waInstance${id}/sendMessage/${token}`;
    const chatId = formatPhone(phone);
    try {
        const result = await httpPost(url, { chatId, message });
        if (result.idMessage) {
            console.log(`[WhatsApp] Sent to ${phone} ✓ (${result.idMessage})`);
        } else {
            console.warn('[WhatsApp] Send failed:', JSON.stringify(result));
        }
        return result;
    } catch (e) {
        console.error('[WhatsApp] HTTP error:', e.message);
    }
}

async function getInstanceState() {
    if (!isConfigured()) return null;
    const { GREEN_API_INSTANCE: id, GREEN_API_TOKEN: token } = process.env;
    const url = `https://api.green-api.com/waInstance${id}/getStateInstance/${token}`;
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
        }).on('error', () => resolve(null));
    });
}

function getStatus() {
    if (!isConfigured()) return { status: 'not_configured' };
    return { status: 'ready', instance: process.env.GREEN_API_INSTANCE };
}

function init() {
    if (isConfigured()) {
        console.log(`[WhatsApp] Green API ready — instance ${process.env.GREEN_API_INSTANCE}`);
    } else {
        console.log('[WhatsApp] Green API not configured — WhatsApp alerts disabled (optional)');
        console.log('[WhatsApp] Add GREEN_API_INSTANCE + GREEN_API_TOKEN to .env — auto-detected on save, no restart needed');
    }
}

module.exports = { init, sendMessage, getStatus, getInstanceState, isConfigured };
