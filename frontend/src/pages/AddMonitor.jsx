import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { addServer, getPlans, getRecipients, API_URL } from '../api';

const authHeaders = () => {
    const t = localStorage.getItem('sm_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function AddMonitor() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', url: 'https://' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [planInterval, setPlanInterval] = useState(null);
    const [plan, setPlan] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [allRecipients, setAllRecipients] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('sm_user') || '{}');
        const p = user?.plan || 'free_trial';
        setPlan(p);
        getPlans().then(r => {
            const s = r.data;
            const iv = p === 'free_trial' ? (s.freeTrialInterval || 300) : (s.plans?.[p]?.interval || 60);
            setPlanInterval(iv);
        }).catch(() => {});
        getRecipients().then(r => {
            const data = r.data.recipients ?? r.data;
            setRecipients(data);
        }).catch(() => {});
    }, []);

    const intervalLabel = planInterval
        ? planInterval >= 60 ? `${planInterval / 60} minute${planInterval / 60 > 1 ? 's' : ''}` : `${planInterval} seconds`
        : '...';

    const toggleRecipient = (id) => {
        setSelectedRecipients(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) { setError('Site name is required'); return; }
        if (!form.url.trim() || form.url === 'https://') { setError('URL is required'); return; }
        setSaving(true);
        try {
            const serverRes = await addServer(form);
            const serverId = serverRes.data._id;

            // If specific recipients selected, assign this server to them
            if (!allRecipients && selectedRecipients.length > 0) {
                await Promise.all(selectedRecipients.map(rid => {
                    const rec = recipients.find(r => r._id === rid);
                    if (!rec) return Promise.resolve();
                    const servers = [...(rec.servers?.map(s => s._id || s) || []), serverId];
                    return axios.put(`${API_URL}/api/recipients/${rid}`, { servers }, { headers: authHeaders() });
                }));
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add monitor');
        }
        setSaving(false);
    };

    return (
        <div className="am-page">
            <div className="am-topbar">
                <button className="am-back" onClick={() => navigate('/dashboard')}>← Monitoring</button>
            </div>

            <div className="am-wrap">
                <h1 className="am-title">Add single monitor <span style={{color:'#7c3aed'}}>.</span></h1>

                <form onSubmit={handleSubmit}>

                    {/* Monitor type */}
                    <div className="am-section">
                        <div className="am-section-label">Monitor type</div>
                        <div className="am-type-box">
                            <span style={{background:'#10b981',color:'#fff',padding:'5px 8px',borderRadius:5,fontSize:11,fontWeight:800,fontFamily:'monospace',flexShrink:0}}>HTTP</span>
                            <div>
                                <div className="am-type-name">HTTP / website monitoring</div>
                                <div className="am-type-desc">Monitor your website, API endpoint, or anything running on HTTP(S).</div>
                            </div>
                        </div>
                    </div>

                    {/* Friendly name */}
                    <div className="am-section">
                        <div className="am-section-label">Friendly name</div>
                        <input className="am-input" type="text" placeholder="e.g. My Website"
                            value={form.name} onChange={e => setForm({...form, name: e.target.value})} autoFocus />
                    </div>

                    {/* URL */}
                    <div className="am-section">
                        <div className="am-section-label">URL to monitor</div>
                        <input className="am-input" type="url" placeholder="https://yoursite.com"
                            value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                    </div>

                    {/* Recipients */}
                    <div className="am-section">
                        <div className="am-section-label">Alert recipients</div>
                        <div className="am-recip-box">
                            {/* All toggle */}
                            <label className="am-recip-all">
                                <input type="checkbox" checked={allRecipients} onChange={e => { setAllRecipients(e.target.checked); setSelectedRecipients([]); }} />
                                <div>
                                    <div style={{fontWeight:700,fontSize:14,color:'#1e1b4b'}}>All recipients</div>
                                    <div style={{fontSize:12,color:'#64748b',marginTop:2}}>All your active recipients will get alerts for this monitor</div>
                                </div>
                            </label>

                            {/* Individual recipients */}
                            {!allRecipients && (
                                <div className="am-recip-list">
                                    {recipients.length === 0 ? (
                                        <div style={{fontSize:13,color:'#94a3b8',padding:'10px 0'}}>No recipients yet — add some in Recipients page</div>
                                    ) : recipients.map(r => (
                                        <label key={r._id} className="am-recip-item">
                                            <input type="checkbox"
                                                checked={selectedRecipients.includes(r._id)}
                                                onChange={() => toggleRecipient(r._id)} />
                                            <div className="am-recip-avatar">{(r.name||'?')[0].toUpperCase()}</div>
                                            <div>
                                                <div style={{fontWeight:600,fontSize:14,color:'#1e1b4b'}}>{r.name}</div>
                                                <div style={{fontSize:12,color:'#94a3b8'}}>{r.email || r.phone || ''}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Monitor interval */}
                    <div className="am-section">
                        <div className="am-section-label">Monitor interval</div>
                        <div className="am-interval-box">
                            <div className="am-interval-info">
                                <span className="am-interval-val">Every {intervalLabel}</span>
                                <span className="am-interval-plan">
                                    {plan === 'free_trial' ? '(Free Trial)' : plan === 'bronze' ? '(Bronze)' : plan === 'silver' ? '(Silver)' : '(Gold)'}
                                </span>
                            </div>
                            <div className="am-interval-sub">Interval is set by your plan and managed by admin.</div>
                            <div className="am-interval-track">
                                <div className="am-interval-bar" style={{ width: planInterval ? `${Math.min(100, Math.max(5, (1 - planInterval/1440)*100))}%` : '30%' }} />
                                <div className="am-interval-labels">
                                    {['30s','1m','5m','30m','1h','12h','24h'].map(l => <span key={l}>{l}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && <div className="am-error">⚠️ {error}</div>}

                    <div className="am-footer">
                        <button type="button" className="am-cancel" onClick={() => navigate('/dashboard')}>Cancel</button>
                        <button type="submit" className="am-submit" disabled={saving}>
                            {saving ? 'Creating...' : 'Create monitor →'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
