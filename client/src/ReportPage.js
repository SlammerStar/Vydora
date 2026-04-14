import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ReportPage() {
  const [reason, setReason] = useState('copyright');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract videoId from query parameters
  const searchParams = new URLSearchParams(location.search);
  const videoId = searchParams.get('videoId');

  const token = localStorage.getItem('token');
  let reporterId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      reporterId = decoded.id;
    } catch (e) {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoId) return alert("Error: No video selected.");
    if (!details.trim()) return alert("Please provide details.");

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ videoId, reason, details, reporterId })
      });

      if (response.ok) {
        alert("Sentinel Report submitted. The Vydora moderation team will review this shortly.");
        navigate(`/video/${videoId}`);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to submit report.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', minHeight: '80vh' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)',
          borderRadius: '12px', color: 'var(--text-secondary)', padding: '8px 16px',
          cursor: 'pointer', fontFamily: 'Inter', fontSize: '14px', fontWeight: '500',
          marginBottom: '32px', transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      >
        ← Go Back
      </button>
      <h1 style={{ fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '10px' }}>
        Sentinel System
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Report intellectual property violations or concerning content.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Issue Category</label>
          <select 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            style={{ 
              padding: '12px 16px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'Inter',
              appearance: 'none'
            }}
          >
            <option value="copyright" style={{ color: 'black' }}>Copyright Infringement</option>
            <option value="inappropriate" style={{ color: 'black' }}>Inappropriate Content</option>
            <option value="spam" style={{ color: 'black' }}>Spam or Misleading</option>
            <option value="other" style={{ color: 'black' }}>Other</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Details</label>
          <textarea 
            value={details} 
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Please provide specific details about the issue..."
            style={{ 
              padding: '16px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              color: 'var(--text-primary)',
              minHeight: '150px',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'Inter'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            padding: '14px',
            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            marginTop: '20px'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}

export default ReportPage;
