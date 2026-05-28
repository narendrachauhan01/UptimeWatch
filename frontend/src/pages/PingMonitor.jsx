import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../api';
import axios from 'axios';

const MAX_RESULTS = 50;

function StatusDot({ alive }) {
    return (
        <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background: alive ? '#10b981' : '#ef4444', flexShrink:0 }} />
    );
}

function latencyColor(ms) {
    if (!ms) return '#ef4444';
    if (ms < 100) return '#10b981';
    if (ms < 300) return '#f59e0b';
    return '#ef4444';
}

export default function PingMonitor() {
    const [target, setTarget] = useState('');
    const [interval, setIntervalVal] = useState(5);
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState([]);
    const [hostname, setHostname] = useState('');
    const [error, setError] = useState('');
    const timerRef = useRef(null);
    const listRef = useRef(null);

    const stats = results.length ? {
        sent: results.length,
        alive: results.filter(r => r.alive).length,
        loss: Math.round((results.filter(r => !r.alive).length / results.length) * 100),
        avg: Math.round(results.filter(r => r.ms).reduce((s, r) => s + r.ms, 0) / (results.filter(r => r.ms).length || 1)),
        min: Math.min(...results.filter(r => r.ms).map(r => r.ms)),
        max: Math.max(...results.filter(r => r.ms).map(r => r.ms)),
    } : null;

    const doPing = async (tgt) => {
        try {
            const token = localStorage.getItem('sm_token');
            const res = await axios.post(`${API_URL}/api/ping`, { target: tgt }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const row = { ...res.data, seq: Date.now() };
            setResults(prev => [row, ...prev].slice(0, MAX_RESULTS));
        } catch (e) {
            setResults(prev => [{ alive: false, ms: null, seq: Date.now(), time: new Date().toISOString(), hostname: tgt, error: e.response?.data?.error || 'Failed' }, ...prev].slice(0, MAX_RESULTS));
        }
    };

    const start = async () => {
        if (!target.trim()) { setError('Enter a hostname or URL'); return; }
        setError('');
        setResults([]);
        setRunning(true);
        setHostname(target.trim());
        await doPing(target.trim());
        timerRef.current = setInterval(() => doPing(target.trim()), interval * 1000);
    };

    const stop = () => {
        setRunning(false);
        clearInterval(timerRef.current);
    };

    useEffect(() => () => clearInterval(timerRef.current), []);

    return (
        <div className="pg-wrap">
            <div className="pg-header">
                <div>
                    <h1 className="pg-title">Ping Monitor</h1>
                    <p className="pg-sub">Real-time connectivity check for any host or URL</p>
                </div>
            </div>

            {/* Config */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:20, marginBottom:20 }}>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
                    <div style={{ flex:1, minWidth:200 }}>
                        <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Host / URL / IP</label>
                        <input
                            value={target} onChange={e => setTarget(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !running && start()}
                            placeholder="e.g. google.com or 8.8.8.8"
                            disabled={running}
                            style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' }}
                        />
                    </div>
                    <div style={{ width:130 }}>
                        <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Interval (sec)</label>
                        <select value={interval} onChange={e => setIntervalVal(Number(e.target.value))} disabled={running}
                            style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14 }}>
                            {[1,2,3,5,10,30].map(v => <option key={v} value={v}>{v}s</option>)}
                        </select>
                    </div>
                    <div>
                        {!running ? (
                            <button onClick={start} style={{ padding:'10px 28px', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                                ▶ Start
                            </button>
                        ) : (
                            <button onClick={stop} style={{ padding:'10px 28px', background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                                ■ Stop
                            </button>
                        )}
                    </div>
                </div>
                {error && <div style={{ marginTop:10, fontSize:13, color:'#ef4444', fontWeight:600 }}>⚠️ {error}</div>}
            </div>

            {/* Stats */}
            {stats && (
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
                    {[
                        { label:'Host', value: hostname, color:'#7c3aed' },
                        { label:'Sent', value: stats.sent, color:'#374151' },
                        { label:'Success', value: stats.alive, color:'#10b981' },
                        { label:'Packet Loss', value: `${stats.loss}%`, color: stats.loss > 0 ? '#ef4444' : '#10b981' },
                        { label:'Avg Latency', value: stats.avg ? `${stats.avg}ms` : '—', color: latencyColor(stats.avg) },
                        { label:'Min', value: stats.min !== Infinity ? `${stats.min}ms` : '—', color:'#10b981' },
                        { label:'Max', value: stats.max !== -Infinity ? `${stats.max}ms` : '—', color:'#f59e0b' },
                    ].map(s => (
                        <div key={s.label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 18px', flex:1, minWidth:90, textAlign:'center' }}>
                            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
                            <div style={{ fontSize:16, fontWeight:800, color: s.color }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', overflow:'hidden' }}>
                    <div style={{ padding:'12px 18px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', display:'flex', gap:24, fontSize:12, fontWeight:700, color:'#64748b' }}>
                        <span style={{ width:40 }}>#</span>
                        <span style={{ width:80 }}>Status</span>
                        <span style={{ width:120 }}>Latency</span>
                        <span>Time</span>
                    </div>
                    <div style={{ maxHeight:'55vh', overflowY:'auto' }} ref={listRef}>
                        {results.map((r, i) => (
                            <div key={r.seq} style={{ display:'flex', alignItems:'center', gap:24, padding:'10px 18px', borderBottom:'1px solid #f1f5f9', fontSize:13 }}>
                                <span style={{ width:40, color:'#94a3b8', fontFamily:'monospace' }}>{results.length - i}</span>
                                <span style={{ width:80, display:'flex', alignItems:'center', gap:6 }}>
                                    <StatusDot alive={r.alive} />
                                    <span style={{ color: r.alive ? '#10b981' : '#ef4444', fontWeight:700 }}>{r.alive ? 'UP' : 'DOWN'}</span>
                                </span>
                                <span style={{ width:120, fontWeight:700, color: latencyColor(r.ms), fontFamily:'monospace' }}>
                                    {r.ms ? `${r.ms} ms` : '—'}
                                </span>
                                <span style={{ color:'#64748b', fontSize:12 }}>
                                    {new Date(r.time).toLocaleTimeString('en-IN')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!running && results.length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'#94a3b8' }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>📡</div>
                    <div style={{ fontSize:16, fontWeight:600 }}>Enter a host and press Start to begin monitoring</div>
                    <div style={{ fontSize:13, marginTop:6 }}>Supports domain names, URLs and IP addresses</div>
                </div>
            )}
        </div>
    );
}
