import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UWLogo from '../components/UWLogo';
import { getPlans } from '../api';

const features = [
  {
    icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: 'Uptime Monitoring',
    desc: '24/7 automated HTTP checks every 60 seconds. Detects downtime within a minute and pings you instantly.',
    color: '#7c3aed',
  },
  {
    icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    title: 'SSL Certificate Alerts',
    desc: 'Tiered warnings at 30, 15, and 7 days before expiry plus a final-day urgent alert. Never let SSL expire silently.',
    color: '#0891b2',
  },
  {
    icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    title: 'Domain Expiry Tracking',
    desc: 'Automated WHOIS lookups keep you ahead of every renewal date. No more last-minute domain panic.',
    color: '#059669',
  },
  {
    icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15z"/></svg>,
    title: 'WhatsApp Alerts',
    desc: 'Real-time WhatsApp notifications via Green API. Get pinged the second your site or SSL needs attention.',
    color: '#d97706',
  },
  {
    icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    title: 'Email Alerts & Receipts',
    desc: 'SMTP-powered HTML emails for downtime, SSL/domain expiry, and payment receipts. Branded and ready to forward.',
    color: '#7c3aed',
  },
  {
    icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    title: 'Performance Charts',
    desc: 'Interactive response-time graphs and uptime history. Spot slow trends before they become outages.',
    color: '#0891b2',
  },
  {
    icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="18" r="1" fill="currentColor"/></svg>,
    title: 'Server Resources (Agent)',
    desc: 'Lightweight agent pushes CPU, RAM, disk, swap, load average, network routes & SSH sessions in real time.',
    color: '#059669',
  },
  {
    icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Multi-Recipient Alerts',
    desc: 'Add teammates or clients per site. Each recipient can receive WhatsApp, Email or both — fully configurable.',
    color: '#d97706',
  },
  {
    icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Secure Razorpay Payments',
    desc: 'PCI-DSS compliant gateway. Pay via UPI, Cards, Netbanking or Wallets — HMAC-signature verified and plan activates instantly.',
    color: '#7c3aed',
  },
];

const PLAN_META = {
  free_trial: {
    name: 'Free Trial', period: 'one-time', badge: null, popular: false,
    note: '5-day trial · ₹2 verification (non-refundable) · Instant activation',
    gradient: 'linear-gradient(135deg,#64748b,#475569)',
    cta: 'Start Free Trial',
  },
  bronze: {
    name: 'Bronze', period: '/month', badge: null, popular: false,
    note: 'Instant activation via Razorpay',
    gradient: 'linear-gradient(135deg,#b45309,#d97706)',
    cta: 'Get Bronze',
  },
  silver: {
    name: 'Silver', period: '/month', badge: 'Most Popular', popular: true,
    note: 'Instant activation via Razorpay',
    gradient: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    cta: 'Get Silver',
  },
  gold: {
    name: 'Gold', period: '/month', badge: 'Best Value', popular: false,
    note: 'Instant activation via Razorpay',
    gradient: 'linear-gradient(135deg,#b45309,#ca8a04)',
    cta: 'Get Gold',
  },
};

const steps = [
  {
    num: '01', title: 'Create Account',
    desc: 'Sign up with name, email and mobile. Email OTP verified instantly — 30 seconds and you’re in.',
    icon: '📝',
  },
  {
    num: '02', title: 'Pay ₹2 via Razorpay',
    desc: 'One-time ₹2 verification through Razorpay (UPI, Card, Netbanking or Wallet). Trial activates the moment payment succeeds.',
    icon: '💳',
  },
  {
    num: '03', title: 'Add Your Sites',
    desc: 'Paste your site URLs. We begin 60-second uptime checks plus SSL & domain expiry monitoring immediately.',
    icon: '🌐',
  },
  {
    num: '04', title: 'Get Instant Alerts',
    desc: 'WhatsApp + Email alerts the moment a site goes down or SSL/domain is near expiry. Add multiple recipients per site.',
    icon: '🔔',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    getPlans().then(r => setPlanData(r.data)).catch(() => {});
  }, []);

  const plans = [
    {
      key: 'free_trial', ...PLAN_META.free_trial,
      price: `₹${planData?.verificationFee ?? 2}`,
      sites: 2,
      features: planData?.freeTrialFeatures?.length ? planData.freeTrialFeatures : ['2 sites monitored', 'Email + WhatsApp alerts', 'SSL & Domain expiry checks', '60s uptime checks', '5-day full access'],
    },
    {
      key: 'bronze', ...PLAN_META.bronze,
      price: `₹${planData?.plans?.bronze?.price ?? 499}`,
      sites: planData?.plans?.bronze?.sites ?? 5,
      features: planData?.plans?.bronze?.features?.length ? planData.plans.bronze.features : ['5 sites monitored', 'Email + WhatsApp alerts', 'SSL & Domain tracking', 'Performance charts', 'Multi-recipient alerts'],
    },
    {
      key: 'silver', ...PLAN_META.silver,
      price: `₹${planData?.plans?.silver?.price ?? 999}`,
      sites: planData?.plans?.silver?.sites ?? 15,
      features: planData?.plans?.silver?.features?.length ? planData.plans.silver.features : ['15 sites monitored', 'Email + WhatsApp alerts', 'SSL & Domain tracking', 'Full analytics & charts', 'Server resource monitoring'],
    },
    {
      key: 'gold', ...PLAN_META.gold,
      price: `₹${planData?.plans?.gold?.price ?? 1499}`,
      sites: planData?.plans?.gold?.sites ?? 30,
      features: planData?.plans?.gold?.features?.length ? planData.plans.gold.features : ['30 sites monitored', 'Email + WhatsApp alerts', 'SSL & Domain tracking', 'Advanced analytics', 'Priority support'],
    },
  ];

  return (
    <div className="lp">

      {/* ═══ NAVBAR ═══ */}
      <nav className="lp-nav">
        <div className="lp-nav-wrap">
          <Link to="/" className="lp-brand">
            <UWLogo size={36} />
            <span className="lp-brand-text">UptimeWatch</span>
          </Link>

          <div className="lp-nav-center">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#payment">Payment</a>
          </div>

          <div className="lp-nav-right">
            <Link to="/login" className="lp-nav-login">Login</Link>
            <Link to="/register" className="lp-nav-cta">Start Free Trial</Link>
          </div>

          <button className={`lp-burger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>

        {menuOpen && (
          <div className="lp-mobile-menu">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#payment" onClick={() => setMenuOpen(false)}>Payment</a>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="lp-nav-cta" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center' }}>Start Free Trial</Link>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-hero-orb lp-orb-1" />
          <div className="lp-hero-orb lp-orb-2" />
          <div className="lp-hero-orb lp-orb-3" />
        </div>
        <div className="lp-hero-wrap">
          <div className="lp-hero-left">
            <div className="lp-hero-tag">
              <span className="lp-tag-dot" />
              99.9% Uptime · 5-Day Free Trial · ₹2 Instant Verification
            </div>
            <h1 className="lp-hero-h1">
              Know When Your<br />
              <span className="lp-hero-gradient">Site Goes Down</span><br />
              Before Users Do
            </h1>
            <p className="lp-hero-p">
              24/7 uptime monitoring with instant WhatsApp & email alerts.
              Track SSL expiry, domain renewals, response time and server resources — all in one dashboard.
              Secure Razorpay checkout. Pay via UPI, Card, Netbanking or Wallets.
            </p>
            <div className="lp-hero-actions">
              <button className="lp-btn-primary" onClick={() => { localStorage.removeItem('sm_intended_plan'); navigate('/register'); }}>
                Start Monitoring Free
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <a href="#pricing" className="lp-btn-outline">View Plans</a>
            </div>
            <div className="lp-hero-trust">
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> 99.9% uptime</div>
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> ₹2 instant verification</div>
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> Setup in 2 minutes</div>
              <div className="lp-trust-item"><span className="lp-trust-check">✓</span> No auto-renewals</div>
            </div>
          </div>

          <div className="lp-hero-right">
            <div className="lp-dashboard-preview">
              <div className="lp-preview-header">
                <div className="lp-preview-dot red" /><div className="lp-preview-dot yellow" /><div className="lp-preview-dot green" />
                <span className="lp-preview-title">UptimeWatch — Dashboard</span>
              </div>
              <div className="lp-preview-stats">
                <div className="lp-stat-chip total"><span className="lp-chip-num">8</span><span>Total</span></div>
                <div className="lp-stat-chip online"><span className="lp-chip-num">6</span><span>Online</span></div>
                <div className="lp-stat-chip offline"><span className="lp-chip-num">2</span><span>Offline</span></div>
              </div>
              <div className="lp-preview-sites">
                <div className="lp-site-row up">
                  <div className="lp-site-dot green" />
                  <div className="lp-site-info"><span>myshop.com</span><span className="lp-site-meta">⚡ 234ms · 🔒 SSL 87d</span></div>
                  <span className="lp-site-badge up">Online</span>
                </div>
                <div className="lp-site-row down">
                  <div className="lp-site-dot red pulse" />
                  <div className="lp-site-info"><span>api.staging.com</span><span className="lp-site-meta" style={{ color: '#ef4444' }}>Alert sent via WhatsApp</span></div>
                  <span className="lp-site-badge down">Offline</span>
                </div>
                <div className="lp-site-row up">
                  <div className="lp-site-dot green" />
                  <div className="lp-site-info"><span>blog.example.com</span><span className="lp-site-meta">⚡ 512ms · 🌐 Domain 42d</span></div>
                  <span className="lp-site-badge up">Online</span>
                </div>
                <div className="lp-site-row warn">
                  <div className="lp-site-dot yellow" />
                  <div className="lp-site-info"><span>store.mysite.in</span><span className="lp-site-meta" style={{ color: '#f59e0b' }}>🔒 SSL expires in 6 days!</span></div>
                  <span className="lp-site-badge warn">SSL Alert</span>
                </div>
              </div>
              <div className="lp-preview-alert">
                <div className="lp-alert-icon">📱</div>
                <div><div className="lp-alert-title">WhatsApp Alert Sent</div><div className="lp-alert-sub">api.staging.com is DOWN — 2 min ago</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <div className="lp-stats-bar">
        {[
          ['99.9%', 'Uptime SLA'],
          ['24/7', 'Always Monitoring'],
          ['60s', 'Check Interval'],
          ['₹2', 'Instant Verification'],
          ['< 60s', 'Alert Latency'],
          ['Razorpay', 'Secure Payments'],
        ].map(([v, l]) => (
          <div key={l} className="lp-stat-item">
            <div className="lp-stat-val">{v}</div>
            <div className="lp-stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* ═══ FEATURES ═══ */}
      <section className="lp-features" id="features">
        <div className="lp-section-wrap">
          <div className="lp-section-eyebrow">Features</div>
          <h2 className="lp-section-h2">Everything in one dashboard</h2>
          <p className="lp-section-sub">No complex setup. Paste your URL, we handle the rest.</p>
          <div className="lp-features-grid">
            {features.map(f => (
              <div key={f.title} className="lp-feat-card">
                <div className="lp-feat-icon" style={{ color: f.color, background: f.color + '15' }}>
                  {f.icon}
                </div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="lp-how" id="how">
        <div className="lp-section-wrap">
          <div className="lp-section-eyebrow">How It Works</div>
          <h2 className="lp-section-h2">Up and running in 4 simple steps</h2>
          <div className="lp-steps" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {steps.map((s, i) => (
              <div key={s.num} className="lp-step">
                <div className="lp-step-icon">{s.icon}</div>
                <div className="lp-step-num">{s.num}</div>
                {i < steps.length - 1 && <div className="lp-step-line" />}
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="lp-pricing" id="pricing">
        <div className="lp-section-wrap">
          <div className="lp-section-eyebrow">Pricing</div>
          <h2 className="lp-section-h2">Simple, transparent pricing</h2>
          <p className="lp-section-sub">Start with a 5-day free trial. Pay only ₹2 to verify (any UPI, card, netbanking or wallet via Razorpay). Upgrade anytime — instant activation.</p>
          <div className="lp-plans">
            {plans.map(p => (
              <div key={p.key} className={`lp-plan ${p.popular ? 'lp-plan-popular' : ''}`}>
                {p.popular && <div className="lp-plan-pop-badge">Most Popular</div>}
                {p.badge && !p.popular && <div className="lp-plan-tag">{p.badge}</div>}
                <div className="lp-plan-top" style={{ background: p.gradient }}>
                  <div className="lp-plan-name">{p.name}</div>
                  <div className="lp-plan-price-row">
                    <span className="lp-plan-price">{p.price}</span>
                    <span className="lp-plan-period">{p.period}</span>
                  </div>
                  <div className="lp-plan-sites">{p.sites} sites included</div>
                </div>
                <div className="lp-plan-body">
                  {p.note && <div className="lp-plan-note">{p.note}</div>}
                  <ul className="lp-plan-list">
                    {p.features.map(f => (
                      <li key={f}>
                        <svg width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="lp-plan-btn" style={{ background: p.gradient }} onClick={() => {
                    const isLoggedIn = !!localStorage.getItem('sm_token');
                    if (p.key !== 'free_trial') localStorage.setItem('sm_intended_plan', p.key);
                    else localStorage.removeItem('sm_intended_plan');
                    if (isLoggedIn) {
                      navigate(p.key === 'free_trial' ? '/pay?plan=verification' : `/pay?plan=${p.key}`);
                    } else {
                      navigate('/register');
                    }
                  }}>
                    {p.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PAYMENT METHOD SECTION ═══ */}
      <section className="lp-payment" id="payment">
        <div className="lp-section-wrap">
          <div className="lp-section-eyebrow">Payment</div>
          <h2 className="lp-section-h2">Secure checkout · Instant activation</h2>
          <p className="lp-section-sub">Powered by Razorpay — India’s most trusted payment gateway. Pay with UPI, Cards, Netbanking or Wallets. Your plan activates the moment payment succeeds — no waiting, no manual review.</p>

          <div className="lp-payment-grid">
            <div className="lp-payment-card">
              <div className="lp-payment-icon">💳</div>
              <h3>Multiple Payment Methods</h3>
              <p>UPI (PhonePe / GPay / Paytm / BHIM), all major Credit & Debit cards (Visa, Mastercard, RuPay), Netbanking from 50+ banks, and popular Wallets.</p>
            </div>
            <div className="lp-payment-card lp-payment-card-highlight">
              <div className="lp-payment-icon">⚡</div>
              <h3>Instant Plan Activation</h3>
              <p>Razorpay confirms the payment, our backend verifies the HMAC-SHA256 signature, and your plan goes <strong>live in seconds</strong>. Receipt emailed automatically.</p>
            </div>
            <div className="lp-payment-card">
              <div className="lp-payment-icon">🔒</div>
              <h3>PCI-DSS Secure</h3>
              <p>We never see or store your card or UPI credentials. End-to-end encryption by Razorpay. No auto-renewals. No subscription traps. Cancel any time.</p>
            </div>
          </div>

          <div className="lp-payment-flow">
            {[
              { step: '1', label: 'Click Pay',           icon: '👆' },
              { step: '2', label: 'Razorpay Opens',      icon: '🪟' },
              { step: '3', label: 'Choose Method',       icon: '💳' },
              { step: '4', label: 'Pay Securely',        icon: '🔐' },
              { step: '5', label: 'Signature Verified',  icon: '✅' },
              { step: '6', label: 'Plan Activated!',     icon: '🚀' },
            ].map((f, i) => (
              <React.Fragment key={f.step}>
                <div className="lp-pay-step">
                  <div className="lp-pay-step-icon">{f.icon}</div>
                  <div className="lp-pay-step-label">{f.label}</div>
                </div>
                {i < 5 && <div className="lp-pay-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>

          <div className="lp-upi-apps">
            <span>Accepted via Razorpay:</span>
            {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Netbanking', 'Wallets'].map(app => (
              <span key={app} className="lp-upi-app-chip">{app}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="lp-cta">
        <div className="lp-cta-orb lp-cta-orb1" />
        <div className="lp-cta-orb lp-cta-orb2" />
        <div className="lp-cta-wrap">
          <h2 className="lp-cta-h2">Start monitoring in 2 minutes</h2>
          <p className="lp-cta-p">99.9% uptime · 5-day free trial · ₹2 instant verification · Secure Razorpay checkout</p>
          <button className="lp-btn-primary lp-cta-btn" onClick={() => navigate('/register')}>
            Get Started Free
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="lp-footer">
        <div className="lp-footer-wrap">
          <div className="lp-footer-brand">
            <UWLogo size={28} />
            <span className="lp-brand-text" style={{ fontSize: 14 }}>UptimeWatch</span>
          </div>
          <div className="lp-footer-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how">How it works</a>
            <a href="#payment">Payment</a>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <div className="lp-footer-copy">© 2026 UptimeWatch · Built by <strong>Narendra Singh</strong></div>
        </div>
      </footer>
    </div>
  );
}
