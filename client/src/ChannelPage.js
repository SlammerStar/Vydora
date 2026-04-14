import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoCard from './components/VideoCard';
import './ChannelPage.css';

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

function formatNum(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

const tabs = ['Videos', 'About'];

export default function ChannelPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subbed, setSubbed] = useState(false);
  const [activeTab, setActiveTab] = useState('Videos');
  const [loading, setLoading] = useState(true);

  const isOwner = user && user._id === id;

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const response = await axios.get(`/api/user/channel/${id}`);
        setChannel(response.data.user);
        setVideos(response.data.videos);
        setSubbed(user?.subscribedUsers?.includes(id));
      } catch (err) {
        console.error('Failed to fetch channel:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChannel();
  }, [id, user]);

  const handleSubscribe = async () => {
    if (!user) return navigate('/signin');
    try {
      await axios.post(`/api/user/subscribe/${id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setSubbed(!subbed);
      setChannel(prev => ({
        ...prev,
        subscribers: subbed
          ? (prev.subscribers || []).filter(uid => uid !== user._id)
          : [...(prev.subscribers || []), user._id],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="channel-page">
        <div className="channel-banner-skeleton skeleton" />
        <div style={{ padding: '0 40px' }}>
          <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 12 }} />
          <div className="skeleton" style={{ width: 200, height: 20, marginBottom: 8, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 6 }} />
        </div>
      </div>
    );
  }

  if (!channel) return (
    <div className="channel-page">
      <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Channel not found.
      </div>
    </div>
  );

  return (
    <div className="channel-page">

      {/* Aurora Banner */}
      <div className="channel-banner">
        {channel.coverImg ? (
          <img src={channel.coverImg} alt="" className="channel-banner-img" />
        ) : (
          <div className="channel-banner-default">
            <div className="banner-orb-1" />
            <div className="banner-orb-2" />
            <div className="banner-orb-3" />
          </div>
        )}
        <div className="channel-banner-overlay" />
      </div>

      {/* Channel Identity */}
      <div className="channel-identity">
        <div className="channel-avatar-wrap">
          <div className="channel-avatar-ring">
            {channel.img ? (
              <img src={channel.img} alt={channel.name} className="channel-avatar-img" referrerPolicy="no-referrer" />
            ) : (
              <span className="channel-avatar-initial">
                {channel.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="channel-meta">
          <div className="channel-name-row">
            <h1 className="channel-name">{channel.name}</h1>
            {channel.verified && (
              <span className="channel-verified-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--cyan)">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                </svg>
              </span>
            )}
          </div>
          <div className="channel-stats">
            <span>{formatNum(channel.subscribers?.length || 0)} followers</span>
            <span className="stat-dot">·</span>
            <span>{videos.length} videos</span>
          </div>
          {channel.description && (
            <p className="channel-desc-preview">
              {channel.description.slice(0, 120)}{channel.description.length > 120 ? '…' : ''}
            </p>
          )}
        </div>

        <div className="channel-actions">
          {isOwner ? (
            <button className="btn-ghost channel-edit-btn" onClick={() => navigate('/settings')}>
              <EditIcon />
              <span>Customize</span>
            </button>
          ) : (
            <button className={`subscribe-btn ${subbed ? 'subbed' : ''}`} onClick={handleSubscribe}>
              {subbed ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="channel-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`channel-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <div className="channel-tabs-line" />
      </div>

      {/* Content */}
      <div className="channel-content">
        {activeTab === 'Videos' && (
          <>
            {videos.length === 0 ? (
              <div className="channel-empty">
                <p>No videos yet</p>
                {isOwner && (
                  <button className="btn-primary" onClick={() => navigate('/upload')}>
                    <span>Upload your first video</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="channel-video-grid">
                {videos.map((v, i) => (
                  <div key={v._id} className="mesh-item" style={{ animationDelay: `${i * 40}ms` }}>
                    <VideoCard video={v} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'About' && (
          <div className="channel-about">
            <div className="about-section">
              <h3 className="about-heading">Description</h3>
              <p className="about-text">
                {channel.description || 'This channel has not added a description yet.'}
              </p>
            </div>

            <div className="about-stats-grid">
              <div className="about-stat-card">
                <span className="about-stat-num">{formatNum(channel.subscribers?.length || 0)}</span>
                <span className="about-stat-label">Subscribers</span>
              </div>
              <div className="about-stat-card">
                <span className="about-stat-num">{videos.length}</span>
                <span className="about-stat-label">Videos</span>
              </div>
              <div className="about-stat-card">
                <span className="about-stat-num">
                  {formatNum(videos.reduce((acc, v) => acc + (v.views || 0), 0))}
                </span>
                <span className="about-stat-label">Total views</span>
              </div>
            </div>

            {channel.email && (
              <div className="about-section">
                <h3 className="about-heading">Contact</h3>
                <a href={`mailto:${channel.email}`} className="about-link">{channel.email}</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
