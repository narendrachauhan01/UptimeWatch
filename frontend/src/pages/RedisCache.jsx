import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

const authHeaders = () => {
    const t = localStorage.getItem('sm_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function RedisCache() {
    const [msg,     setMsg]     = useState('');
    const [loading, setLoading] = useState(false);

    const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 5000); };

    const clearAll = async () => {
        if (!window.confirm('Clear all SSL & Domain cache? Fresh data will be fetched on next check.')) return;
        setLoading(true);
        try {
            const r = await axios.post(`${API_URL}/api/admin/clear-cache`, {}, { headers: authHeaders() });
            showMsg(`✅ Cleared ${r.data.cleared} cached entries. Next SSL/Domain check will fetch fresh data.`);
        } catch { showMsg('❌ Failed — Redis may not be running'); }
        setLoading(false);
    };

    return (
        <div className="pg-wrap">
            <div className="pg-header">
                <div>
                    <h1 className="pg-title">Redis Cache <span style={{color:'#7c3aed'}}>.</span></h1>
                    <p className="pg-sub">Manage SSL & Domain expiry cache (30 min TTL)</p>
                </div>
            </div>

            {msg && (
                <div style={{ background: msg.startsWith('✅')?'#f0fdf4':'#fef2f2', border:`1px solid ${msg.startsWith('✅')?'#bbf7d0':'#fecdd3'}`, color: msg.startsWith('✅')?'#16a34a':'#dc2626', borderRadius:12, padding:'12px 18px', marginBottom:20, fontWeight:600, fontSize:14 }}>
                    {msg}
                </div>
            )}

            {/* Info */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
                {[
                    { icon:'⏱', label:'Cache TTL', value:'30 minutes', desc:'Data refreshed every 30 min automatically' },
                    { icon:'🔒', label:'SSL Cache', value:'ssl:hostname', desc:'One entry per domain' },
                    { icon:'🌐', label:'Domain Cache', value:'domain:rootdomain', desc:'One entry per root domain' },
                    { icon:'⚡', label:'Speed gain', value:'~5ms vs 3-8s', desc:'Cache hit vs WHOIS API call' },
                ].map(s => (
                    <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e2e8f0', padding:'18px 20px' }}>
                        <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
                        <div style={{ fontSize:12, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
                        <div style={{ fontSize:16, fontWeight:800, color:'#1e1b4b', marginBottom:4 }}>{s.value}</div>
                        <div style={{ fontSize:12, color:'#64748b' }}>{s.desc}</div>
                    </div>
                ))}
            </div>

            {/* Clear button */}
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e2e8f0', padding:24 }}>
                <div style={{ fontWeight:800, fontSize:16, color:'#1e1b4b', marginBottom:6 }}>🗑 Clear SSL & Domain Cache</div>
                <div style={{ fontSize:13, color:'#64748b', marginBottom:20, lineHeight:1.7 }}>
                    Clears all cached SSL certificate and domain expiry data from Redis.<br/>
                    Fresh data will be fetched from WHOIS API on next check (every 6 hours or manual "Check" click).<br/>
                    <strong>When to clear:</strong> After renewing SSL, after renewing domain, or if wrong data is showing.
                </div>
                <button onClick={clearAll} disabled={loading}
                    style={{ padding:'12px 28px', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer', opacity:loading?0.7:1, display:'flex', alignItems:'center', gap:8 }}>
                    {loading ? '⏳ Clearing...' : '🗑 Clear All Cache'}
                </button>
            </div>

            {/* How it works */}
            <div style={{ background:'#f8fafc', borderRadius:16, border:'1px solid #e2e8f0', padding:24, marginTop:20 }}>
                <div style={{ fontWeight:700, fontSize:15, color:'#1e1b4b', marginBottom:14 }}>How Redis Cache Works</div>
                {[
                    { n:'1', t:'First request', d:'SSL/Domain check → WHOIS API called (3-8 seconds) → result saved to Redis' },
                    { n:'2', t:'Next 30 minutes', d:'Same domain requested → Redis cache hit → instant response (< 5ms)' },
                    { n:'3', t:'After 30 min', d:'Cache expires automatically → WHOIS API called again → Redis updated' },
                    { n:'4', t:'Manual clear', d:'Click "Clear All Cache" → next check fetches fresh data immediately' },
                ].map(s => (
                    <div key={s.n} style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'#7c3aed', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, flexShrink:0 }}>{s.n}</div>
                        <div>
                            <div style={{ fontWeight:700, fontSize:14, color:'#1e1b4b' }}>{s.t}</div>
                            <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>{s.d}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
