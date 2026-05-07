import React, { useEffect, useState } from 'react';
import { getAlerts } from '../api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { getAlerts().then(r => setAlerts(r.data)); }, []);

  const filtered = alerts.filter(a => {
    const matchSearch = a.serverName?.toLowerCase().includes(search.toLowerCase()) ||
      a.serverUrl?.toLowerCase().includes(search.toLowerCase()) ||
      a.sentTo?.some(r => r.name.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'all' || a.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="section-header">
        <h2>Alert History</h2>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by site name, URL or recipient..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="filter-tabs">
          {[{ key: 'all', label: `All (${alerts.length})` }, { key: 'down', label: '🔴 Down' }, { key: 'recovered', label: '✅ Recovered' }].map(f => (
            <button key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty">{alerts.length === 0 ? 'No alerts yet.' : 'No results found.'}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Site</th>
                <th>URL</th>
                <th>Message</th>
                <th>Sent To</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id}>
                  <td>
                    <span className={`badge ${a.type === 'down' ? 'badge-down' : 'badge-up'}`}>
                      {a.type === 'down' ? 'DOWN' : 'RECOVERED'}
                    </span>
                  </td>
                  <td><strong>{a.serverName}</strong></td>
                  <td style={{ fontSize: 12 }}>{a.serverUrl}</td>
                  <td style={{ fontSize: 12 }}>{a.message}</td>
                  <td style={{ fontSize: 12 }}>{a.sentTo?.map(r => r.name).join(', ') || '-'}</td>
                  <td className="response-time">{new Date(a.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
