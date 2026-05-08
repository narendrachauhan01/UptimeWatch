import React, { useEffect, useState } from 'react';
import { getAlerts } from '../api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { getAlerts().then(r => setAlerts(r.data)); }, []);

  const filtered = alerts.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.serverName?.toLowerCase().includes(q) || a.serverUrl?.toLowerCase().includes(q) || a.sentTo?.some(r => r.name.toLowerCase().includes(q));
    const matchFilter = filter === 'all' || a.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="pg-wrap">
      <div className="pg-header">
        <div>
          <h1 className="pg-title">Alert History</h1>
          <p className="pg-sub">{alerts.length} total alerts</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="search-input" placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="filter-pills">
          {[['all',`All (${alerts.length})`],['down','Down'],['recovered','Recovered']].map(([k,l]) => (
            <button key={k} className={`filter-pill ${filter===k?'active':''}`} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="data-card">
        {filtered.length === 0 ? (
          <div className="empty-msg">{alerts.length === 0 ? 'No alerts yet. Alerts appear here when a site goes down.' : 'No results found.'}</div>
        ) : filtered.map(a => (
          <div key={a._id} className={`alert-row alert-${a.type}`}>
            <div className={`alert-badge ${a.type}`}>{a.type === 'down' ? '↓ Down' : '↑ Recovered'}</div>
            <div className="alert-info">
              <div className="alert-site">{a.serverName}</div>
              <div className="alert-url">{a.serverUrl}</div>
            </div>
            <div className="alert-meta">
              {a.sentTo?.length > 0 && <span className="meta-txt">📨 {a.sentTo.map(r => r.name).join(', ')}</span>}
              <span className="meta-txt">{new Date(a.createdAt).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
