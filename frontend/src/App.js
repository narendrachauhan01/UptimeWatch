import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Servers from './pages/Servers';
import Recipients from './pages/Recipients';
import WhatsAppPage from './pages/WhatsApp';
import Alerts from './pages/Alerts';
import DomainSSL from './pages/DomainSSL';
import Charts from './pages/Charts';
import './App.css';

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  React.useEffect(() => setOpen(false), [location]);

  const links = [
    { to: '/charts', label: 'Analytics' },
    { to: '/', label: 'Dashboard' },
    { to: '/servers', label: 'Servers' },
    { to: '/recipients', label: 'Recipients' },
    { to: '/alerts', label: 'Alerts' },
    { to: '/domain-ssl', label: 'Domain & SSL' },
    { to: '/whatsapp', label: 'WhatsApp' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand"><div className="nav-logo">SM</div><span>Server Monitor</span></div>
      <button className="nav-hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <div className={`nav-links ${open ? 'nav-open' : ''}`}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
      </div>
      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} />}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/recipients" element={<Recipients />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/domain-ssl" element={<DomainSSL />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <div className="footer-bottom">
            <span>© 2026 All rights reserved &mdash; Built & managed by <strong>Narendra Singh</strong> &mdash; DevOps Engineer</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
