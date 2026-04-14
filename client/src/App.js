import React, { useState, useRef, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { Routes, Route, useLocation } from 'react-router-dom';
import VideoPage from './VideoPage';
import UploadPage from './UploadPage';
import LoginPage from './LoginPage';
import MyVideosPage from './MyVideosPage';
import SignupPage from './SignupPage';
import ProfilePage from './ProfilePage';
import ChannelPage from './ChannelPage';
import HomePage from './HomePage';
import HistoryPage from './HistoryPage';
import WatchLaterPage from './WatchLaterPage';
import PlaylistsPage from './PlaylistsPage';
import ReportPage from './ReportPage';
import CommunitiesPage from './CommunitiesPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showScroll, setShowScroll] = useState(false);
  const [user, setUser] = useState(null);
  const mainContentRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (e) {
        console.error('Invalid token');
        localStorage.removeItem('token');
      }
    }
  }, [location.pathname]);

  const handleScroll = (e) => {
    if (e.target.scrollTop > 300) {
      setShowScroll(true);
    } else {
      setShowScroll(false);
    }
  };

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
      <Navbar search={search} setSearch={setSearch} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar isOpen={isSidebarOpen} setSearch={setSearch} />

        <div 
          ref={mainContentRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-color)', position: 'relative' }} 
          id="main-content"
        >
          <Routes>
            <Route path="/" element={<HomePage search={search} user={user} />} />
            <Route path="/my-videos" element={<MyVideosPage user={user} />} />
            <Route path="/video/:id" element={<VideoPage user={user} />} />
            <Route path="/channel/:id" element={<ChannelPage user={user} />} />
            <Route path="/upload" element={<UploadPage user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/history" element={<HistoryPage user={user} />} />
            <Route path="/watch-later" element={<WatchLaterPage user={user} />} />
            <Route path="/playlists" element={<PlaylistsPage user={user} />} />
            <Route path="/report" element={<ReportPage user={user} />} />
            <Route path="/communities" element={<CommunitiesPage user={user} />} />
          </Routes>
          
          {showScroll && (
            <div 
              onClick={scrollToTop}
              style={{
                position: 'fixed',
                bottom: '40px',
                right: '40px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#1a73e8',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 1000,
                transition: 'opacity 0.3s'
              }}
              title="Go to top"
            >
              <FaArrowUp size={20} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;