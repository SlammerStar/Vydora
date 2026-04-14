import React, { useEffect, useState } from 'react';
import VideoCard from './components/VideoCard';
import { useNavigate } from 'react-router-dom';

function WatchLaterPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
        navigate('/login');
        return;
    }
    fetch('http://localhost:5001/api/user/watchlater', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setVideos(data.filter(v => v !== null));
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
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Watch Later</h2>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '1000px'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : videos.length === 0 ? (
          <h3 style={{ color: 'var(--text-secondary)' }}>
            This list has no videos.
          </h3>
        ) : (
          videos.map((video, index) => (
            <VideoCard key={`${video._id}-${index}`} video={video} layout="list" />
          ))
        )}
      </div>
    </div>
  );
}

export default WatchLaterPage;
