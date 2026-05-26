import React, { useEffect, useState } from 'react';
import { getWaStatus } from '../api';

export default function WhatsAppPage() {
  const [info,    setInfo]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWaStatus()
      .then(r => setInfo(r.data))
      .catch(() => setInfo({ status: 'not_configured' }))
      .finally(() => setLoading(false));
  }, []);

  const notConfigured = !info || info.status === 'not_configured';
  const instanceState = info?.instanceState;
  const isConnected   = info?.status === 'ready' && instanceState === 'authorized';
  const isWrongCreds  = info?.status === 'ready' && instanceState && instanceState !== 'authorized';
  const isCredsSet    = info?.status === 'ready' && !instanceState;

  const statusBadge = () => {
    if (loading)       return { cls: 'wa-connecting',  icon: '⏳', text: 'Checking connection...' };
    if (notConfigured) return { cls: 'wa-disconnected', icon: '⚙️',  text: 'Not Configured (optional)' };
    if (isConnected)   return { cls: 'wa-ready',        icon: '✅', text: `Connected — Instance ${info.instance}` };
    if (isWrongCreds)  return { cls: 'wa-disconnected', icon: '❌', text: `Invalid credentials — Instance state: ${instanceState}` };
    if (isCredsSet)    return { cls: 'wa-disconnected', icon: '⚠️',  text: 'Credentials set but could not verify — check Instance ID & Token' };
    return { cls: 'wa-disconnected', icon: '❌', text: 'Not Connected' };
  };

  const badge = statusBadge();

  return (
    <div className="pg-wrap">
      <div className="pg-header">
        <div>
          <h1 className="pg-title">WhatsApp Alerts</h1>
          <p className="pg-sub">Powered by Green API — Optional · App runs normally without this</p>
        </div>
      </div>

      {/* Status badge */}
      <div className={`wa-status ${badge.cls}`}>
        <span style={{ fontSize: 20 }}>{badge.icon}</span>
        {badge.text}
      </div>

      {/* Invalid credentials warning */}
      {isWrongCreds && (
        <div className="card" style={{ borderLeft: '4px solid #dc2626', background: '#fef2f2', marginBottom: 20 }}>
          <h3 style={{ color: '#dc2626', fontSize: 14, marginBottom: 8 }}>❌ Invalid Credentials</h3>
          <p style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
            The <strong>GREEN_API_INSTANCE</strong> or <strong>GREEN_API_TOKEN</strong> in your <code>.env</code> file
            is incorrect, or the instance is not authorized on Green API.
            Get your real credentials from <strong>green-api.com</strong> and update the <code>.env</code> file.
          </p>
        </div>
      )}

      {/* Setup guide */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
          ⚙️ Setup Guide — Green API (Free · 200 messages/month)
        </h3>

        <div className="wa-setup-steps">
          <div className="wa-step">
            <div className="wa-step-num">1</div>
            <div>
              <strong>Create a free account at green-api.com</strong>
              <p>Free plan includes 200 messages/month — more than enough for uptime alerts</p>
            </div>
          </div>
          <div className="wa-step">
            <div className="wa-step-num">2</div>
            <div>
              <strong>Dashboard → Create Instance → Select Free plan</strong>
              <p>Scan the QR code using <strong>WhatsApp Business</strong> app (not personal WhatsApp) — keeps your account safe</p>
            </div>
          </div>
          <div className="wa-step">
            <div className="wa-step-num">3</div>
            <div>
              <strong>Copy your Instance ID and API Token</strong>
              <p>Make sure the instance state shows <code>authorized</code></p>
            </div>
          </div>
          <div className="wa-step">
            <div className="wa-step-num">4</div>
            <div>
              <strong>Update your server's <code>.env</code> file:</strong>
              <pre className="wa-env-box">{`GREEN_API_INSTANCE=your_instance_id\nGREEN_API_TOKEN=your_api_token`}</pre>
            </div>
          </div>
          <div className="wa-step">
            <div className="wa-step-num">5</div>
            <div>
              <strong>Save the file — no restart needed, auto-detected ✅</strong>
              <p>The service detects new credentials automatically when the file is saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>How It Works</h3>
        <ul style={{ paddingLeft: 20, fontSize: 14, color: '#555', lineHeight: 2 }}>
          <li>Site goes <strong>DOWN</strong> → recipients receive <strong>1 WhatsApp alert</strong> (no spam)</li>
          <li>Site remains down → no repeated messages</li>
          <li>Site comes back <strong>UP</strong> → 1 recovery notification sent</li>
          <li>Not configured → app works perfectly, WhatsApp alerts are silently skipped</li>
          <li>Each recipient can have their own WhatsApp number set in the Recipients section</li>
        </ul>
      </div>
    </div>
  );
}
