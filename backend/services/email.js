const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }
    return transporter;
}

async function sendEmail(to, subject, html) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) return;
    try {
        await getTransporter().sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to,
            subject,
            html,
        });
        console.log(`[Email] Sent to ${to}: ${subject}`);
    } catch (e) {
        console.error(`[Email] Failed to send to ${to}:`, e.message);
    }
}

function downEmailHtml(name, url, time) {
    return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:28px 32px;text-align:center">
        <div style="font-size:42px;margin-bottom:8px">🚨</div>
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800">Site Down Alert!</h1>
      </div>
      <div style="padding:28px 32px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase">Site Name</td><td style="padding:10px 0;color:#0f172a;font-weight:700;font-size:15px">${name}</td></tr>
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;border-top:1px solid #f1f5f9">URL</td><td style="padding:10px 0;border-top:1px solid #f1f5f9"><a href="${url}" style="color:#7c3aed;font-weight:600">${url}</a></td></tr>
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;border-top:1px solid #f1f5f9">Status</td><td style="padding:10px 0;border-top:1px solid #f1f5f9"><span style="background:#fee2e2;color:#dc2626;padding:4px 12px;border-radius:20px;font-weight:700;font-size:12px">DOWN ❌</span></td></tr>
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;border-top:1px solid #f1f5f9">Time</td><td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#475569">${time}</td></tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:#fff8f8;border:1px solid #fecdd3;border-radius:12px;color:#dc2626;font-size:14px;font-weight:600;text-align:center">
          ⚠️ Please check the server immediately!
        </div>
      </div>
      <div style="padding:16px 32px;background:#f8fafc;text-align:center;color:#94a3b8;font-size:12px">
        SM Server Monitor &mdash; &copy; 2026 Narendra Singh
      </div>
    </div>`;
}

function recoveredEmailHtml(name, url, time) {
    return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:28px 32px;text-align:center">
        <div style="font-size:42px;margin-bottom:8px">✅</div>
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800">Site Recovered!</h1>
      </div>
      <div style="padding:28px 32px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase">Site Name</td><td style="padding:10px 0;color:#0f172a;font-weight:700;font-size:15px">${name}</td></tr>
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;border-top:1px solid #f1f5f9">URL</td><td style="padding:10px 0;border-top:1px solid #f1f5f9"><a href="${url}" style="color:#7c3aed;font-weight:600">${url}</a></td></tr>
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;border-top:1px solid #f1f5f9">Status</td><td style="padding:10px 0;border-top:1px solid #f1f5f9"><span style="background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:20px;font-weight:700;font-size:12px">UP ✅</span></td></tr>
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;border-top:1px solid #f1f5f9">Time</td><td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#475569">${time}</td></tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;color:#16a34a;font-size:14px;font-weight:600;text-align:center">
          🎉 Site is back up and running!
        </div>
      </div>
      <div style="padding:16px 32px;background:#f8fafc;text-align:center;color:#94a3b8;font-size:12px">
        SM Server Monitor &mdash; &copy; 2026 Narendra Singh
      </div>
    </div>`;
}

function sslEmailHtml(name, url, daysLeft, expiry) {
    const emoji = daysLeft <= 7 ? '🚨' : daysLeft <= 15 ? '⚠️' : '📢';
    const color = daysLeft <= 7 ? '#ef4444' : daysLeft <= 15 ? '#f59e0b' : '#7c3aed';
    return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,${color},${color}cc);padding:28px 32px;text-align:center">
        <div style="font-size:42px;margin-bottom:8px">${emoji}</div>
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800">SSL Certificate Expiring!</h1>
      </div>
      <div style="padding:28px 32px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase">Site</td><td style="padding:10px 0;color:#0f172a;font-weight:700;font-size:15px">${name}</td></tr>
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;border-top:1px solid #f1f5f9">URL</td><td style="padding:10px 0;border-top:1px solid #f1f5f9"><a href="${url}" style="color:#7c3aed;font-weight:600">${url}</a></td></tr>
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;border-top:1px solid #f1f5f9">Expires</td><td style="padding:10px 0;border-top:1px solid #f1f5f9;color:#475569">${new Date(expiry).toDateString()}</td></tr>
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;border-top:1px solid #f1f5f9">Days Left</td><td style="padding:10px 0;border-top:1px solid #f1f5f9"><span style="background:${color}20;color:${color};padding:4px 12px;border-radius:20px;font-weight:800;font-size:14px">${daysLeft} days</span></td></tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:#faf5ff;border:1px solid #ddd6fe;border-radius:12px;color:#7c3aed;font-size:14px;font-weight:600;text-align:center">
          🔒 Please renew your SSL certificate immediately!
        </div>
      </div>
      <div style="padding:16px 32px;background:#f8fafc;text-align:center;color:#94a3b8;font-size:12px">
        SM Server Monitor &mdash; &copy; 2026 Narendra Singh
      </div>
    </div>`;
}

module.exports = { sendEmail, downEmailHtml, recoveredEmailHtml, sslEmailHtml };
