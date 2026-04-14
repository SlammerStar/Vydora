import React from 'react';

function CommunitiesPage() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '16px' }}>
        Niche Communities Hub
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '18px' }}>
        Connect with like-minded creators, share knowledge, and dive deep into your passions. 
        The Next-Gen Vydora Communities feature is currently in development.
      </p>
      
      <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '24px', 
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
          <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              boxShadow: '0 0 30px var(--primary-glow)'
          }}>
              🚀
          </div>
          <h2 style={{ fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
              Stay Tuned
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '400px', lineHeight: '1.6' }}>
              We're building dedicated spaces for programming, art, science, and more. 
              Get ready for a whole new way to learn and collaborate.
          </p>
      </div>
    </div>
  );
}

export default CommunitiesPage;
