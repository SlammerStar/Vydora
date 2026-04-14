import React, { useEffect, useState } from 'react';
import VideoCard from './components/VideoCard';

function MyVideosPage() {
  const [videos, setVideos] = useState([]);
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5001/api/video/my-videos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setVideos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, [token]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this video?");
    if (!confirmDelete) return;
    try {
      await fetch(`http://localhost:5001/api/video/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "30px", background: "var(--bg-color)", minHeight: "100%" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
         <h2 style={{ margin: 0, fontWeight: "600", fontSize: '28px' }}>Channel Content</h2>
         <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>{videos.length} Videos</div>
      </div>
      
      {loading ? (
         <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      ) : videos.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "10vh", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', color: 'var(--border-color)' }}>📹</div>
          <h3 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '8px' }}>No videos uploaded yet</h3>
          <p style={{ fontSize: '16px' }}>Start uploading and build your channel</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "40px 20px" }}>
          {videos.map(video => (
            <div key={video._id}>
              <VideoCard video={video} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyVideosPage;