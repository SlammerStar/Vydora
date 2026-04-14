import React, { useState } from 'react';
import { FaCloudUploadAlt, FaVideo, FaImage } from 'react-icons/fa';

function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleVideoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setVideo(file);
          const videoElement = document.createElement('video');
          videoElement.preload = 'metadata';
          videoElement.onloadedmetadata = function() {
              window.URL.revokeObjectURL(videoElement.src);
              setDuration(videoElement.duration);
          };
          videoElement.src = URL.createObjectURL(file);
      }
  };

  const handleUpload = async () => {
    if (!title || !video || !thumbnail) {
      alert("Title, video & thumbnail required");
      return;
    }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video', video);
    formData.append('thumbnail', thumbnail);
    formData.append('duration', duration);

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/video/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      alert(data.message || "Uploaded!");
      setTitle('');
      setDescription('');
      setVideo(null);
      setThumbnail(null);
      setDuration(0);
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 20px", display: "flex", justifyContent: "center" }}>
      <div style={{
        background: "var(--surface-color)",
        padding: "40px",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "900px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid var(--border-color)"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
           <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>Upload Video</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
           {/* LEFT - Form */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Details</label>
                <input
                  type="text"
                  placeholder="Add a title that describes your video"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", outline: "none", fontSize: "15px", boxSizing: "border-box" }}
                  onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              <div>
                <textarea
                  placeholder="Tell viewers about your video"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", outline: "none", fontSize: "15px", boxSizing: "border-box", height: "120px", resize: "vertical" }}
                  onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              {/* FILES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ position: 'relative', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '30px 20px', textAlign: 'center', backgroundColor: 'var(--hover-bg)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#eef2f6'} onMouseLeave={e => e.currentTarget.style.backgroundColor='var(--hover-bg)'}>
                    <FaVideo size={30} color="var(--text-secondary)" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: '500', marginBottom: '4px', color: '#1a73e8' }}>{video ? video.name : 'Select Video File'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>MP4, WebM or OGG</div>
                    <input type="file" accept="video/*" onChange={handleVideoChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                 </div>

                 <div style={{ position: 'relative', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '30px 20px', textAlign: 'center', backgroundColor: 'var(--hover-bg)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#eef2f6'} onMouseLeave={e => e.currentTarget.style.backgroundColor='var(--hover-bg)'}>
                    <FaImage size={30} color="var(--text-secondary)" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: '500', marginBottom: '4px', color: '#1a73e8' }}>{thumbnail ? thumbnail.name : 'Upload Thumbnail'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>JPG, PNG or WEBP</div>
                    <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                 </div>
              </div>
           </div>

           {/* RIGHT - Preview & Submit */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Preview</label>
                 <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#e5e5e5', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {thumbnail ? (
                       <img src={URL.createObjectURL(thumbnail)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                       <FaCloudUploadAlt size={40} color="#ccc" />
                    )}
                 </div>
                 <div style={{ marginTop: '12px', padding: '16px', backgroundColor: 'var(--hover-bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Video Link</div>
                    <span style={{ color: '#1a73e8', wordBreak: 'break-all', fontSize: '14px', cursor: 'pointer' }}>https://devtube.com/watch?v=preview</span>
                 </div>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => {setTitle(''); setDescription(''); setVideo(null); setThumbnail(null); setDuration(0);}} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
                 <button onClick={handleUpload} disabled={loading} style={{ padding: '10px 24px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Uploading...' : 'Publish'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;