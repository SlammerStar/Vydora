import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import VideoCard from './components/VideoCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/* ─────────────────────────────────────────────
   Magic Studio — per-tool modal
───────────────────────────────────────────── */
function StudioModal({ tool, onClose }) {
  const [phase, setPhase] = useState('idle');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [myVideos, setMyVideos] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetch('/api/video/my-videos', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setMyVideos(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [token]);

  const run = () => {
    if (!selectedVideo) { alert('Please pick a video first.'); return; }
    setPhase('processing');
    setTimeout(() => setPhase('done'), 2800);
  };

  const results = {
    highlights: '✂️  3 highlight clips extracted:\n• 00:02:10 – 00:03:45  (Key Concept)\n• 00:08:00 – 00:09:20  (Formula Derivation)\n• 00:14:55 – 00:16:10  (Summary)',
    studyguide: '📝  Study Guide Generated (PDF ready):\n• Chapter Summary  (2 pages)\n• Key Formulas Sheet\n• 10 Practice Questions\n• Answer Key',
    noise: '🎙️  Audio cleaned successfully:\n• Background hum removed  (−38 dB)\n• Echo suppression applied\n• Normalised to −14 LUFS\n• Ready to export',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000, padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #0f0f18, #12101e)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px', padding: '40px',
          maxWidth: '520px', width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>{tool.emoji}</div>
        <h2 style={{ fontFamily: 'Outfit', margin: '0 0 8px', color: 'var(--text-primary)', fontSize: '22px' }}>
          {tool.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
          {tool.desc}
        </p>

        {phase === 'idle' && (
          <>
            <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Select a video
            </label>
            <select
              value={selectedVideo}
              onChange={e => setSelectedVideo(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', fontFamily: 'Inter', fontSize: '14px',
                outline: 'none', marginBottom: '20px', cursor: 'pointer'
              }}
            >
              <option value="" style={{ background: '#1a1a2e' }}>-- Choose a video --</option>
              {myVideos.map(v => (
                <option key={v._id} value={v._id} style={{ background: '#1a1a2e' }}>{v.title}</option>
              ))}
              {myVideos.length === 0 && (
                <option disabled style={{ background: '#1a1a2e' }}>No videos uploaded yet</option>
              )}
            </select>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={run}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                  color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer'
                }}
              >
                Run {tool.title}
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 20px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {phase === 'processing' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '56px', height: '56px', margin: '0 auto 20px',
              border: '4px solid rgba(255,255,255,0.1)',
              borderTop: '4px solid var(--primary-color)',
              borderRadius: '50%',
              animation: 'ms-spin 0.8s linear infinite'
            }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Processing your video… this may take a moment.
            </p>
            <style>{`@keyframes ms-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {phase === 'done' && (
          <div>
            <div style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '12px', padding: '20px', marginBottom: '20px'
            }}>
              <p style={{ color: '#4ade80', fontWeight: '700', marginBottom: '12px', fontSize: '15px' }}>✅ Complete!</p>
              <pre style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0 }}>
                {results[tool.id]}
              </pre>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => alert('Download feature coming with the full AI backend!')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer'
                }}
              >
                ⬇ Download Result
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 20px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tool definitions
───────────────────────────────────────────── */
const STUDIO_TOOLS = [
  {
    id: 'highlights',
    emoji: '✂️',
    title: 'Smart Highlights',
    label: 'Auto-extract key moments',
    desc: 'Automatically extract the most educational segments from your long-form lectures into bite-sized clips.',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
    border: 'rgba(124,58,237,0.35)',
  },
  {
    id: 'studyguide',
    emoji: '📝',
    title: 'Auto-Study Guides',
    label: 'Generate PDF + quiz',
    desc: 'Generate PDF study guides and interactive quizzes instantly from your video transcript.',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(16,185,129,0.08))',
    border: 'rgba(6,182,212,0.35)',
  },
  {
    id: 'noise',
    emoji: '🎙️',
    title: 'Noise Removal',
    label: 'Clean lecture audio',
    desc: 'Remove classroom background noise and echo from your lecture recordings with one click.',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.08))',
    border: 'rgba(245,158,11,0.35)',
  },
];

/* ─────────────────────────────────────────────
   Main ProfilePage component
───────────────────────────────────────────── */
function ProfilePage() {
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;

  const [videos, setVideos] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('Analytics');
  const [activeTool, setActiveTool] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/video/my-videos', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setVideos(Array.isArray(d) ? d : [])).catch(() => {});

    fetch('/api/user/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setAnalytics(d)).catch(() => {});
  }, [token]);

  if (!user) return <h2 style={{ padding: '40px', textAlign: 'center' }}>Please log in</h2>;

  const avatarSrc = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`;

  const chartData = [
    { name: 'Mon', views: 20 }, { name: 'Tue', views: 45 },
    { name: 'Wed', views: 30 }, { name: 'Thu', views: 80 },
    { name: 'Fri', views: 50 }, { name: 'Sat', views: 90 },
    { name: 'Sun', views: 120 },
  ];

  const tab = (label, key) => (
    <div
      onClick={() => setActiveTab(key)}
      style={{
        padding: '12px 0',
        borderBottom: activeTab === key ? '2px solid var(--primary-color)' : '2px solid transparent',
        fontWeight: '600', cursor: 'pointer',
        color: activeTab === key ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
      }}
    >
      {label}
    </div>
  );

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100%' }}>
      {/* Banner */}
      <div style={{
        width: '100%', height: '208px',
        backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)',
        backgroundSize: 'cover', backgroundPosition: 'center'
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Identity row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <img
            src={avatarSrc}
            alt="profile"
            referrerPolicy="no-referrer"
            style={{ width: '128px', height: '128px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-color)', marginTop: '-40px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', flexWrap: 'wrap' }}>
              <span>{user.email}</span>
              <span>•</span>
              <span>{analytics?.subscribers || 0} followers</span>
              <span>•</span>
              <span>{videos.length} videos</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Welcome to my Vydora channel! Dedicated to profound learning and science.
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button style={{ padding: '8px 16px', borderRadius: '18px', border: 'none', background: 'var(--text-primary)', color: 'var(--bg-color)', cursor: 'pointer', fontWeight: '500' }}>
                Customize channel
              </button>
              <button style={{ padding: '8px 16px', borderRadius: '18px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}>
                Manage videos
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', gap: '24px', fontFamily: 'Outfit' }}>
          {tab('Home', 'Home')}
          {tab('Creator Studio', 'Analytics')}
          {tab(<><span style={{ color: activeTab === 'MagicStudio' ? 'var(--accent-color)' : 'inherit' }}>✨</span> Magic Studio</>, 'MagicStudio')}
        </div>

        {/* ── HOME ── */}
        {activeTab === 'Home' && (
          <>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Uploads</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px 16px' }}>
              {videos.map(v => <VideoCard key={v._id} video={v} />)}
            </div>
            {videos.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '60px' }}>No videos uploaded yet.</p>
            )}
          </>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'Analytics' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Channel Analytics</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {[['Total Views', analytics?.views || 0], ['Watch Time (hrs)', analytics?.watchTime || 0], ['Followers', analytics?.subscribers || 0]].map(([label, val]) => (
                <div key={label} style={{ padding: '24px', background: 'var(--hover-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</h4>
                  <p style={{ fontSize: '36px', margin: '8px 0 0', fontWeight: 'bold' }}>{val}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              <div style={{ padding: '24px', background: 'var(--hover-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Views — Last 7 Days</h4>
                <div style={{ height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="cvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }} itemStyle={{ color: '#1a73e8', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="views" stroke="#1a73e8" strokeWidth={3} fillOpacity={1} fill="url(#cvg)" isAnimationActive animationDuration={1400} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ padding: '24px', background: 'var(--hover-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Followers</h4>
                {analytics?.recentSubscribers?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {analytics.recentSubscribers.map(s => (
                      <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || 'U')}&background=random`} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                        <span style={{ fontWeight: '500' }}>{s.name}</span>
                      </div>
                    ))}
                    <div style={{ paddingTop: '12px', color: '#1a73e8', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>See all</div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No recent followers yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MAGIC STUDIO ── */}
        {activeTab === 'MagicStudio' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px', padding: '48px 40px',
              display: 'flex', flexDirection: 'column', gap: '36px'
            }}>
              <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '32px', margin: '0 0 14px', color: 'var(--text-primary)' }}>
                  ✨ AI Magic Studio
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '15px', margin: 0 }}>
                  Enhance your lectures, automate captions, and generate study guides with Vydora's educational AI tools. Click any card to launch the tool.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                {STUDIO_TOOLS.map(tool => (
                  <div
                    key={tool.id}
                    onClick={() => setActiveTool(tool)}
                    style={{
                      background: tool.gradient, padding: '28px', borderRadius: '20px',
                      border: `1px solid ${tool.border}`, cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '14px' }}>{tool.emoji}</div>
                    <h4 style={{ fontFamily: 'Outfit', fontSize: '18px', margin: '0 0 8px', color: 'var(--text-primary)' }}>{tool.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 20px', lineHeight: 1.5 }}>{tool.desc}</p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(255,255,255,0.08)', border: `1px solid ${tool.border}`,
                      borderRadius: '20px', padding: '6px 14px',
                      color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px'
                    }}>
                      {tool.label} →
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
                Powered by Vydora AI Engine · Beta
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Magic Studio Modal */}
      {activeTool && <StudioModal tool={activeTool} onClose={() => setActiveTool(null)} />}
    </div>
  );
}

export default ProfilePage;