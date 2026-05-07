import React, { useEffect, useState } from 'react';
import { getServers, API_URL } from '../api';
import axios from 'axios';

export default function DomainSSL() {
  const [servers, setServers] = useState([]);
  const [checking, setChecking] = useState({});
  const [results, setResults] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [checkingAll, setCheckingAll] = useState(false);

  const load = () => getServers().then(r => setServers(r.data));
  useEffect(() => { load(); }, []);

  const checkOne = async (server) => {
    setChecking(p => ({ ...p, [server._id]: true }));
    try {
      const res = await axios.get(`${API_URL}/api/expiry/${server._id}`);
      setResults(p => ({ ...p, [server._id]: res.data }));
      load();
    } catch (e) {
      setResults(p => ({ ...p, [server._id]: { error: 'Failed' } }));
    }
    setChecking(p => ({ ...p, [server._id]: false }));
  };

  const checkAll = async () => {
    setCheckingAll(true);
    for (const s of servers) await checkOne(s);
    setCheckingAll(false);
  };

  const daysLeft = (date) => {
    if (!date) return null;
    return Math.floor((new Date(date) - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const expiryClass = (days) => {
    if (days == null) return 'expiry-na';
    if (days <= 7) return 'expiry-critical';
    if (days <= 30) return 'expiry-warn';
    return 'expiry-ok';
  };

  const expiryLabel = (days, date) => {
    if (days == null) return 'Not set';
    return `${days}d — ${new Date(date).toLocaleDateString('en-IN')}`;
  };

  const getSslInfo = (s) => {
    const r = results[s._id];
    if (r?.ssl) return { days: r.ssl.daysLeft, date: r.ssl.expiry };
    if (s.sslExpiry) return { days: s.sslDaysLeft, date: s.sslExpiry };
    return null;
  };

  const getDomainInfo = (s) => {
    const r = results[s._id];
    if (r?.domain) return { days: r.domain.daysLeft, date: r.domain.expiry, registrar: r.domain.registrar };
    if (s.domainExpiry) return { days: daysLeft(s.domainExpiry), date: s.domainExpiry };
    return null;
  };

  const filtered = servers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.url.toLowerCase().includes(search.toLowerCase());
    const ssl = getSslInfo(s);
    const dom = daysLeft(s.domainExpiry);
    if (filter === 'ssl-warn') return matchSearch && ssl && ssl.days <= 30;
    if (filter === 'domain-warn') return matchSearch && dom != null && dom <= 30;
    if (filter === 'no-domain') return matchSearch && !s.domainExpiry;
    return matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Domain & SSL</h1>
          <p className="page-subtitle">Monitor SSL certificates and domain expiry for all sites</p>
        </div>
        <button className="btn-refresh" onClick={checkAll} disabled={checkingAll}>
          {checkingAll ? 'Checking...' : 'Check All'}
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by site name or URL..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="filter-tabs">
          {[
            { key: 'all', label: `All (${servers.length})` },
            { key: 'ssl-warn', label: '⚠️ SSL Expiring' },
            { key: 'domain-warn', label: '⚠️ Domain Expiring' },
            { key: 'no-domain', label: '🌐 No Domain Set' },
          ].map(f => (
            <button key={f.key}
              className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty">No sites found.</div>
        ) : (
          <table className="ssl-table">
            <thead>
              <tr>
                <th>Site</th>
                <th>URL</th>
                <th>🔒 SSL Certificate</th>
                <th>🌐 Domain Expiry</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const ssl = getSslInfo(s);
                const domDays = daysLeft(s.domainExpiry);
                const r = results[s._id];
                return (
                  <tr key={s._id}>
                    <td>
                      <div className="ssl-site-name-td">{s.name}</div>
                      <div className={`ssl-status-dot-inline ${s.status}`}></div>
                    </td>
                    <td>
                      <a href={s.url} target="_blank" rel="noreferrer" className="ssl-url-link">{s.url}</a>
                    </td>
                    <td>
                      {r?.error ? (
                        <span className="expiry-badge expiry-critical">Error</span>
                      ) : ssl ? (
                        <div>
                          <span className={`expiry-badge ${expiryClass(ssl.days)}`}>
                            {ssl.days} days left
                          </span>
                          <div className="ssl-sub-date">{new Date(ssl.date).toLocaleDateString('en-IN')}</div>
                        </div>
                      ) : (
                        <span className="expiry-badge expiry-na">Click Check</span>
                      )}
                    </td>
                    <td>
                      {(() => {
                        const di = getDomainInfo(s);
                        return di ? (
                          <div>
                            <span className={`expiry-badge ${expiryClass(di.days)}`}>{di.days} days left</span>
                            <div className="ssl-sub-date">{new Date(di.date).toLocaleDateString('en-IN')}</div>
                            {di.registrar && <div className="ssl-sub-date" style={{color:'#7c3aed'}}>🏢 {di.registrar}</div>}
                          </div>
                        ) : (
                          <span className="expiry-badge expiry-na">Click Check</span>
                        );
                      })()}
                    </td>
                    <td>
                      <button
                        className={`btn-check-ssl-sm ${checking[s._id] ? 'loading' : ''}`}
                        onClick={() => checkOne(s)}
                        disabled={checking[s._id]}
                      >
                        {checking[s._id] ? '...' : '🔍 Check'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
