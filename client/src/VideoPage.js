import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash as TrashIcon } from 'react-icons/fa';
import VideoCard from './components/VideoCard';
import './VideoPage.css';

const LikeIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const FlagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const SubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

function formatNum(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export default function VideoPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [related, setRelated] = useState([]);
  const [liked, setLiked] = useState(false);
  const [subbed, setSubbed] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('comments');
  const [ambientColor, setAmbientColor] = useState('');
  const [expanded, setExpanded] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const [vRes] = await Promise.all([
          axios.get(`/api/video/${id}`),
        ]);
        const v = vRes.data;
        setVideo(v);

        // the backend populates 'user', not 'userId'
        if (v.user) {
          setChannel(v.user);
          setSubbed(user?.subscriptions?.includes(v.user._id));
        }
        
        // Initialize comments locally
        setComments(v.comments || []);

        const relRes = await axios.get(`/api/video`);
        setRelated(relRes.data.filter(rv => rv._id !== id).slice(0, 8));

        await axios.post(`/api/video/view/${id}`);
      } catch (err) {
        console.error('Failed to load video:', err);
      }
    };

    fetchData();
  }, [id, user]);

  // Ambient mode — sample color from video thumbnail
  useEffect(() => {
    if (!video?.thumbnailUrl && !video?.imgUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = video.thumbnailUrl || video.imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1; canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      setAmbientColor(`rgba(${r}, ${g}, ${b}, 0.15)`);
    };
  }, [video]);

  const handleLike = async () => {
    if (!user) return navigate('/signin');
    try {
      await axios.post(`/api/video/${liked ? 'dislike' : 'like'}/${id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setLiked(!liked);
      setVideo(prev => ({
        ...prev,
        likes: liked
          ? (prev.likes || []).filter(uid => uid !== user._id)
          : [...(prev.likes || []), user._id]
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return navigate('/signin');
    try {
      await axios.post(`/api/user/subscribe/${video.user._id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setSubbed(!subbed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    try {
      const res = await axios.post(`/api/video/comment/${id}`, { text: comment }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setComments(res.data);
      setComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await axios.delete(`/api/video/comment/${id}/${commentId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!video) {
    return (
      <div className="video-page loading">
        <div className="vp-player-skeleton skeleton" />
        <div className="vp-info-skeleton">
          <div className="skeleton" style={{ height: 28, width: '70%', marginBottom: 12, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 6 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="video-page">

      {/* Ambient background */}
      <div
        className="ambient-bg"
        style={{ background: ambientColor || 'transparent' }}
      />

      <div className="vp-layout">

        {/* Top: Player */}
        <div className="vp-main">
          <div className="vp-player-wrap">
            {video.youtubeVideoId ? (
              <iframe
                className="vp-player"
                src={`https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                className="vp-player"
                src={`/api/video/stream/${video._id}`}
                controls
                autoPlay
                poster={video.thumbnailUrl || video.imgUrl}
              />
            )}
          </div>
        </div>
        
        <div className="vp-bottom-row">
          <div className="vp-info">
            <h1 className="vp-title">{video.title}</h1>

            <div className="vp-controls-bar">
              <div className="vp-stats">
                <span>{formatNum(video.views)} views</span>
                <span className="dot">·</span>
                <span>{video.tags?.join(', ')}</span>
              </div>

              <div className="vp-actions">
                <button
                  className={`vp-action-btn ${liked ? 'active' : ''}`}
                  onClick={handleLike}
                >
                  <LikeIcon filled={liked} />
                  <span>{formatNum(video.likes?.length || 0)}</span>
                </button>

                <button className="vp-action-btn">
                  <ShareIcon />
                  <span>Share</span>
                </button>

                <button
                  className="vp-action-btn sentinel"
                  onClick={() => navigate(`/report?videoId=${video._id}`)}
                >
                  <FlagIcon />
                  <span>Report</span>
                </button>
              </div>
            </div>

            <div className="divider" />

            <div className="vp-channel-row">
              <Link to={`/channel/${video.userId}`} className="vp-channel-avatar">
                {channel?.img ? (
                  <img src={channel.img} alt={channel.name} referrerPolicy="no-referrer" />
                ) : (
                  <span>{channel?.name?.charAt(0) || 'C'}</span>
                )}
              </Link>

              <div className="vp-channel-info">
                <Link to={`/channel/${video.userId}`} className="vp-channel-name">
                  {channel?.name || 'Unknown Channel'}
                </Link>
                <span className="vp-channel-subs">
                  {formatNum(channel?.subscribers?.length || 0)} subscribers
                </span>
              </div>

              <button
                className={`subscribe-btn ${subbed ? 'subbed' : ''}`}
                onClick={handleSubscribe}
              >
                {subbed ? (
                  <>
                    <SubIcon />
                    <span>Following</span>
                  </>
                ) : (
                  <span>Follow</span>
                )}
              </button>
            </div>

            <div className={`vp-description ${expanded ? 'expanded' : ''}`}>
              <p>{video.description || 'No description provided.'}</p>
              {video.description && video.description.length > 200 && (
                <button
                  className="vp-desc-toggle"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
          </div>

        {/* Right: Comments + Related */}
        <div className="vp-sidebar">

          <div className="vp-tabs">
            {['comments', 'related'].map(tab => (
              <button
                key={tab}
                className={`vp-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'comments' && (
            <div className="vp-comments">
              {user && (
                <form className="comment-form" onSubmit={handleComment}>
                  <div className="comment-avatar avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-input-wrap">
                    <input
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="comment-input"
                    />
                    {comment && (
                      <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
                        <span>Post</span>
                      </button>
                    )}
                  </div>
                </form>
              )}

              <div className="comment-list">
                {comments.length === 0 && (
                  <p className="empty-state">Be the first to comment</p>
                )}
                {comments.map(c => (
                  <div key={c._id} className="comment-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <img 
                        src={c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || 'U')}&background=random`} 
                        alt="avatar" 
                        referrerPolicy="no-referrer"
                        style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} 
                      />
                      <div>
                        <span className="comment-name">{c.user?.name || 'Unknown'}</span>
                        <p className="comment-text">{c.text}</p>
                      </div>
                    </div>
                    {user && c.user?._id === user.id && (
                      <button 
                        onClick={() => handleDeleteComment(c._id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
                        title="Delete Comment"
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'related' && (
            <div className="vp-related">
              {related.map(rv => (
                <VideoCard key={rv._id} video={rv} size="compact" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
