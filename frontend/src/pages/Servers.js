import React, { useEffect, useState } from 'react';
import { getServers, addServer, deleteServer, updateServer } from '../api';

const empty = { name: '', url: '', checkInterval: 60, domainExpiry: '' };

export default function Servers() {
  const [servers, setServers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => getServers().then(r => setServers(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.url) return;
    await addServer(form);
    setForm(empty);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this server?')) return;
    await deleteServer(id);
    load();
  };

  const toggleActive = async (s) => {
    await updateServer(s._id, { active: !s.active });
    load();
  };

  const startEdit = (s) => {
    setEditId(s._id);
    const de = s.domainExpiry ? new Date(s.domainExpiry).toISOString().split('T')[0] : '';
    setEditForm({ name: s.name, url: s.url, checkInterval: s.checkInterval, domainExpiry: de });
  };

  const cancelEdit = () => { setEditId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editForm.name || !editForm.url) return;
    await updateServer(editId, editForm);
    setEditId(null);
    load();
  };

  return (
    <div>
      <h2>Servers</h2>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Add Server</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Site Name</label>
              <input placeholder="e.g. K&B Maintenance" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Site URL</label>
              <input placeholder="https://yoursite.com" value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="form-group" style={{ maxWidth: 140 }}>
              <label>Interval (sec)</label>
              <input type="number" value={form.checkInterval}
                onChange={e => setForm({ ...form, checkInterval: parseInt(e.target.value) })} />
            </div>
            <button type="submit" className="btn btn-primary">Add Server</button>
          </div>
        </form>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by name or URL..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="filter-tabs">
          {[{ key: 'all', label: 'All' }, { key: 'up', label: '✅ Online' }, { key: 'down', label: '🔴 Offline' }].map(f => (
            <button key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {servers.length === 0 ? (
          <div className="empty">No servers added yet.</div>
        ) : (() => {
          const filtered = servers.filter(s => {
            const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.url.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === 'all' || s.status === filter;
            return matchSearch && matchFilter;
          });
          return filtered.length === 0 ? <div className="empty">No results found.</div> : (
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>URL</th>
                <th>Interval</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <React.Fragment key={s._id}>
                  <tr>
                    <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                    <td><strong>{s.name}</strong></td>
                    <td style={{ fontSize: 13 }}>{s.url}</td>
                    <td>{s.checkInterval}s</td>
                    <td>
                      <span className={`badge ${s.active ? 'badge-active' : 'badge-inactive'}`}>
                        {s.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn-action edit" onClick={() => startEdit(s)}>✏️ Edit</button>
                        <button className="btn-action pause" onClick={() => toggleActive(s)}>
                          {s.active ? 'Pause' : 'Resume'}
                        </button>
                        <button className="btn-action delete" onClick={() => handleDelete(s._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>

                  {editId === s._id && (
                    <tr>
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div className="inline-edit-panel">
                          <div className="inline-edit-title">✏️ Edit — <strong>{s.name}</strong></div>
                          <div className="inline-edit-row">
                            <div className="form-group">
                              <label>Site Name</label>
                              <input value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Site URL</label>
                              <input value={editForm.url}
                                onChange={e => setEditForm({ ...editForm, url: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ maxWidth: 140 }}>
                              <label>Interval (sec)</label>
                              <input type="number" value={editForm.checkInterval}
                                onChange={e => setEditForm({ ...editForm, checkInterval: parseInt(e.target.value) })} />
                            </div>
                            <div className="form-group" style={{ maxWidth: 170 }}>
                              <label>Domain Expiry Date</label>
                              <input type="date" value={editForm.domainExpiry || ''}
                                onChange={e => setEditForm({ ...editForm, domainExpiry: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                              <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          );
        })()}
      </div>
    </div>
  );
}
