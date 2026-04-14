import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaListUl, FaPlay } from 'react-icons/fa';

function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
        navigate('/login');
        return;
    }
    fetch('http://localhost:5001/api/playlist/my-playlists', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlaylists(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [token, navigate]);

  return (
    <div style={{
      padding: '24px',
      backgroundColor: 'var(--bg-color)',
      minHeight: '100%'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        Playlists
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {loading ? (
          <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : playlists.length === 0 ? (
          <div style={{ gridColumn: '1/-1', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
            <h3>No playlists created yet</h3>
          </div>
        ) : (
          playlists.map((playlist) => {
             const firstVideo = playlist.videos[0];
             const coverImg = firstVideo && firstVideo.thumbnailUrl
                ? (firstVideo.thumbnailUrl.startsWith('http')
                    ? firstVideo.thumbnailUrl
                    : `http://localhost:5001/${firstVideo.thumbnailUrl}`)
                : "https://via.placeholder.com/300x180?text=No+Videos";

             return (
               <div key={playlist._id} style={{ cursor: 'pointer' }} onClick={() => firstVideo ? navigate(`/video/${firstVideo._id}`) : null}>
                 <div style={{
                   position: 'relative',
                   width: '100%',
                   aspectRatio: '16/9',
                   borderRadius: '12px',
                   overflow: 'hidden',
                   backgroundColor: '#e5e5e5',
                   marginBottom: '12px',
                   boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                 }}>
                   
                   {/* Stack Effect Wrapper */}
                   <div style={{ position: 'absolute', top: '-4px', left: '4%', right: '4%', height: '10%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px 8px 0 0', zIndex: 0 }} />
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, backgroundColor: 'black' }}>
                       <img
                         src={coverImg}
                         alt={playlist.name}
                         style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                       />
                       
                       <div style={{
                         position: 'absolute',
                         bottom: '8px',
                         right: '8px',
                         backgroundColor: 'rgba(0,0,0,0.8)',
                         color: 'white',
                         padding: '4px 8px',
                         borderRadius: '4px',
                         fontSize: '12px',
                         fontWeight: '500',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '4px'
                       }}>
                         <FaListUl size={10} />
                         {playlist.videos.length} videos
                       </div>

                       <div style={{
                           position: 'absolute',
                           top: 0, left: 0, right: 0, bottom: 0,
                           backgroundColor: 'rgba(0,0,0,0.3)',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           opacity: 0,
                           transition: 'opacity 0.2s',
                       }}
                       onMouseEnter={e => e.currentTarget.style.opacity = 1}
                       onMouseLeave={e => e.currentTarget.style.opacity = 0}
                       >
                           <FaPlay size={32} color="white" />
                       </div>
                   </div>

                 </div>

                 <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                   {playlist.name}
                 </h3>
                 <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {playlist.isPrivate ? 'Private' : 'Public'} • Playlist
                 </div>
               </div>
             );
          })
        )}
      </div>
    </div>
  );
}

export default PlaylistsPage;
