import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisV } from 'react-icons/fa';

function VideoCard({ video, layout = 'grid', onDelete }) {
  const navigate = useNavigate();
  const isList = layout === 'list';
  
  const [localDuration, setLocalDuration] = useState(video.duration || 0);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const token = localStorage.getItem('token');

  const fetchPlaylists = async () => {
      try {
          const res = await fetch('http://localhost:5001/api/playlist/my-playlists', {
              headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          setPlaylists(data);
      } catch (e) {
          console.error(e);
      }
  };

  const handleOpenPlaylist = (e) => {
      e.stopPropagation();
      setShowMenu(false);
      if(!token) return alert('Please login to save to playlist');
      setShowPlaylistModal(true);
      fetchPlaylists();
  };

  const toggleVideoInPlaylist = async (playlistId) => {
      try {
          await fetch(`http://localhost:5001/api/playlist/${playlistId}/toggle-video`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ videoId: video._id })
          });
          fetchPlaylists(); // Refresh state
      } catch (e) {
          console.error(e);
      }
  };

  const handleCreatePlaylist = async (e) => {
      e.stopPropagation();
      if (!newPlaylistName.trim()) return;
      try {
          const res = await fetch(`http://localhost:5001/api/playlist/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ name: newPlaylistName })
          });
          const newPlaylist = await res.json();
          await fetch(`http://localhost:5001/api/playlist/${newPlaylist._id}/toggle-video`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ videoId: video._id })
          });
          setNewPlaylistName('');
          fetchPlaylists();
      } catch (e) {
          console.error(e);
      }
  };

  const handleWatchLater = async (e) => {
      e.stopPropagation();
      setShowMenu(false);
      if(!token) return alert('Please login to save to watch later');
      try {
          await fetch(`http://localhost:5001/api/user/watchlater/${video._id}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
          });
          alert('Watch Later list updated!');
      } catch (err) {
          console.error(err);
      }
  };

  const handleShare = (e) => {
      e.stopPropagation();
      setShowMenu(false);
      navigator.clipboard.writeText(`${window.location.origin}/video/${video._id}`);
      alert('Link copied to clipboard!');
  };

  const handleDownload = (e) => {
      e.stopPropagation();
      setShowMenu(false);
      const link = document.createElement('a');
      link.href = `http://localhost:5001/api/video/stream/${video._id}`;
      link.download = `${video.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  useEffect(() => {
      if (!video.duration || video.duration === 0) {
          const v = document.createElement('video');
          v.preload = 'metadata';
          v.onloadedmetadata = () => {
              setLocalDuration(v.duration);
              fetch(`http://localhost:5001/api/video/duration/${video._id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ duration: v.duration })
              }).catch(err => console.log('Silent duration fix failed', err));
          };
          v.src = `http://localhost:5001/api/video/stream/${video._id}`;
      }
  }, [video._id, video.duration]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff/86400)} days ago`;
    return `${Math.floor(diff/2592000)} months ago`;
  };

  const getRealViews = (v) => {
    if (v === undefined || v === null) return '0';
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return `${v}`;
  };

  const formatDuration = (sec) => {
    if (!sec) return '0:00';
    const total = Math.floor(sec);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${m}:${pad(s)}`;
  };

  const views = getRealViews(video.views);

  const handleMouseEnter = () => {
      hoverTimeout.current = setTimeout(() => {
          setIsHovered(true);
      }, 700);
  };

  const handleMouseLeave = () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      setIsHovered(false);
  };

  return (
    <>
    <div 
      style={{
        display: 'flex',
        flexDirection: isList ? 'row' : 'column',
        gap: isList ? '16px' : '0',
        cursor: 'pointer',
        marginBottom: isList ? '12px' : '0',
        position: 'relative',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: !isList && isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
      onClick={() => navigate(`/video/${video._id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={video.title}
    >
      <div style={{
        width: isList ? '200px' : '100%',
        aspectRatio: '16/9',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0a0a0f',
        flexShrink: 0,
        boxShadow: !isList && isHovered ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        {isHovered ? (
          <video 
            src={`http://localhost:5001/api/video/stream/${video._id}`}
            autoPlay 
            muted 
            loop 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          />
        ) : (
          <img
            className="thumbnail-img"
            src={video.thumbnailUrl
              ? (video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `http://localhost:5001/${video.thumbnailUrl}`)
              : (video.youtubeVideoId ? `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg` : 'https://placehold.co/480x360/1a1a2e/white?text=No+Thumbnail')}
            alt={video.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease-out, filter 0.3s',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              filter: isHovered ? 'brightness(0.7)' : 'brightness(1)'
            }}
            onError={(e) => {
              if (video.youtubeVideoId) {
                if (e.target.src.includes('maxresdefault') || e.target.src.includes('sddefault')) {
                  e.target.src = `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`;
                } else if (e.target.src.includes('hqdefault')) {
                  e.target.src = `https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`;
                } else {
                  e.target.src = 'https://placehold.co/480x360/1a1a2e/white?text=No+Thumbnail';
                }
              } else {
                e.target.src = 'https://placehold.co/480x360/1a1a2e/white?text=No+Thumbnail';
              }
            }}
          />
        )}
        
        {/* Overlay Duration */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          backgroundColor: 'rgba(5, 5, 10, 0.8)',
          backdropFilter: 'blur(4px)',
          color: 'white',
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '8px',
          fontWeight: '600',
          transition: 'opacity 0.2s',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {formatDuration(localDuration)}
        </div>
      </div>
      
      <div style={{
        padding: isList ? '0' : '16px 8px 8px 8px',
        display: 'flex',
        gap: '14px',
        flex: 1,
        marginTop: isList ? '0' : '4px'
      }}>
         {!isList && (
           <img 
             src={video.user?.avatar
               ? (video.user.avatar.startsWith('http') ? video.user.avatar : `http://localhost:5001/${video.user.avatar}`)
               : `https://ui-avatars.com/api/?name=${encodeURIComponent(video.user?.name || 'U')}&background=random&color=fff`}
             style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }}
             alt="channel avatar"
             referrerPolicy="no-referrer"
             onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.user?.name || 'U')}&background=random&color=fff`; }}
           />
         )}
         <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <h3 style={{
               margin: 0,
               fontSize: '16px',
               fontWeight: '600',
               display: '-webkit-box',
               WebkitLineClamp: 2,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden',
               lineHeight: '1.5',
               color: 'var(--text-primary)',
               flex: 1,
               paddingRight: '12px',
               fontFamily: 'Outfit'
             }}>
               {video.title}
             </h3>
             
             {/* Options Menu directly in DOM */}
             <div style={{ position: 'relative' }}>
                <div 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  style={{ 
                     padding: '6px', 
                     cursor: 'pointer', 
                     color: 'var(--text-secondary)',
                     opacity: isHovered || showMenu ? 1 : 0,
                     transition: 'opacity 0.2s',
                     borderRadius: '50%'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FaEllipsisV size={14}/>
                </div>
                {showMenu && (
                  <div style={{
                     position: 'absolute',
                     right: 0,
                     top: '100%',
                     backgroundColor: 'rgba(20, 20, 25, 0.95)',
                     backdropFilter: 'blur(20px)',
                     border: '1px solid var(--border-color)',
                     borderRadius: '12px',
                     boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                     zIndex: 50,
                     width: '210px',
                     padding: '8px 0',
                     overflow: 'hidden'
                  }}>
                    <div onClick={handleWatchLater} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-primary)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Add to Queue</div>
                    <div onClick={handleOpenPlaylist} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-primary)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Save to Knowledge Base</div>
                    <div onClick={handleDownload} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-primary)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Download Original</div>
                    <div onClick={handleShare} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-primary)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Share Link</div>
                    <div onClick={(e) => { e.stopPropagation(); setShowMenu(false); alert('Sentinel reporting form opened.'); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: '#fbbf24', borderTop: '1px solid var(--border-color)', transition: 'background 0.2s', fontWeight: '500' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.1)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Sentinel - Report Issue</div>
                    {onDelete && (
                       <div onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(video._id); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: '#f87171', borderTop: '1px solid var(--border-color)', transition: 'background 0.2s', fontWeight: '500' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Delete Content</div>
                    )}
                  </div>
                )}
             </div>
           </div>
           
           <div style={{
             fontSize: '13px',
             color: 'var(--text-secondary)',
             marginTop: '8px',
             display: 'flex',
             flexDirection: 'column',
             gap: '4px',
             fontWeight: '400'
           }}>
             <span 
                 style={{ transition: 'color 0.2s', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} 
                 onClick={(e) => { 
                     e.stopPropagation(); 
                     if(video.user?._id) navigate(`/channel/${video.user._id}`); 
                 }}
                 onMouseEnter={(e) => e.target.style.color = '#e5e7eb'} 
                 onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
             >
                 {video.user?.name || 'Unknown Channel'}
             </span>
             <span style={{ fontSize: '12px', opacity: 0.8 }}>{views} views • {formatTimeAgo(video.createdAt)}</span>
           </div>
         </div>
      </div>
    </div>
    
    {showPlaylistModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); setShowPlaylistModal(false); }}>
            <div style={{ backgroundColor: 'rgba(20, 20, 25, 0.95)', padding: '24px', borderRadius: '20px', width: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                   <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>Save to Knowledge Base</h3>
                   <span style={{ cursor: 'pointer', fontSize: '24px', color: 'var(--text-secondary)' }} onClick={() => setShowPlaylistModal(false)}>&times;</span>
                </div>
                
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', paddingRight: '8px' }}>
                    {playlists.map(pl => {
                        const inPlaylist = pl.videos.some(v => v._id === video._id || v === video._id);
                        return (
                            <div key={pl._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => toggleVideoInPlaylist(pl._id)}>
                                <input type="checkbox" checked={inPlaylist} readOnly style={{ cursor: 'pointer', accentColor: 'var(--primary-color)' }} />
                                <span style={{ fontSize: '14px' }}>{pl.name}</span>
                            </div>
                        );
                    })}
                    {playlists.length === 0 && <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>No Knowledge Bases found</div>}
                </div>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            placeholder="New base name..." 
                            value={newPlaylistName} 
                            onChange={e => setNewPlaylistName(e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                        <button 
                            onClick={handleCreatePlaylist}
                            style={{ padding: '10px 16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )}
    </>
  );
}

export default VideoCard;
