import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Servers from './pages/Servers';
import Recipients from './pages/Recipients';
import WhatsAppPage from './pages/WhatsApp';
import Alerts from './pages/Alerts';
import DomainSSL from './pages/DomainSSL';
import Charts from './pages/Charts';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand"><span>Server Monitor</span></div>
          <div className="nav-links">
            <NavLink to="/charts">Analytics</NavLink>
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/servers">Servers</NavLink>
            <NavLink to="/recipients">Recipients</NavLink>
            <NavLink to="/alerts">Alerts</NavLink>
            <NavLink to="/domain-ssl">Domain & SSL</NavLink>
            <NavLink to="/whatsapp">WhatsApp</NavLink>
          </div>
        </nav>
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
          <span>Managed by <strong>Narendra Singh</strong> &mdash; DevOps Engineer</span>
        </footer>
      </div>
    </BrowserRouter>
  );
}
