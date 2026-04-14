import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaHistory, FaRegPlayCircle, FaBook, FaFlask, FaUsers, FaCompass, FaChalkboardTeacher, FaRocket, FaChevronRight
} from 'react-icons/fa';
import { MdOutlineWatchLater } from 'react-icons/md';
import { jwtDecode } from 'jwt-decode';

function Sidebar({ isOpen, setSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [channels, setChannels] = useState([]);

  // Decode logged-in user id to filter self from subscriptions
  const token = localStorage.getItem('token');
  let loggedUserId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      loggedUserId = decoded.id;
    } catch (e) {}
  }

  useEffect(() => {
    fetch('http://localhost:5001/api/user/all-channels')
      .then(res => res.json())
      .then(data => setChannels(Array.isArray(data) ? data : []))
      .catch(err => console.log('Channels fetch error:', err));
  }, []);

  const mainLinks = [
    { name: 'Command Center', icon: <FaHome size={20} />, path: '/' },
    { name: 'Discover', icon: <FaCompass size={20} />, path: null },
  ];

  const youLinks = [
    { name: 'My Archives', icon: <FaHistory size={20} />, path: '/history', requiresAuth: true },
    { name: 'Knowledge Bases', icon: <FaBook size={20} />, path: '/playlists', requiresAuth: true },
    { name: 'Queue', icon: <MdOutlineWatchLater size={20} />, path: '/watch-later', requiresAuth: true },
    { name: 'My Creations', icon: <FaRegPlayCircle size={20} />, path: '/my-videos', requiresAuth: true },
  ];

  const exploreLinks = [
    { name: 'Research Labs', icon: <FaFlask size={20} />, path: null },
    { name: 'Social Nexus', icon: <FaUsers size={20} />, path: null },
    { name: 'Masterclasses', icon: <FaChalkboardTeacher size={20} />, path: null },
    { name: 'Future Tech', icon: <FaRocket size={20} />, path: null },
  ];

  const handleClick = (item) => {
    if (!item.path) return;
    if (item.requiresAuth && !token) {
      navigate('/login');
      return;
    }
    if (item.path === '/' && setSearch) setSearch('');
    navigate(item.path);
  };

  const renderItem = (item, isSub = false, subPath = null) => {
    const isActive = item.path && location.pathname === item.path && item.path !== '/';
    const isHomeActive = location.pathname === '/' && item.name === 'Command Center';
    const active = isActive || isHomeActive;
    const isDisabled = !isSub && !item.path;

    return (
      <div
        key={item._id || item.name}
        onClick={() => {
          if (isSub && subPath) navigate(subPath);
          else if (!isSub) handleClick(item);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: '16px',
          cursor: isDisabled ? 'default' : 'pointer',
          backgroundColor: active ? 'var(--primary-color)' : 'transparent',
          fontWeight: active ? '600' : '500',
          color: active ? '#fff' : (isDisabled ? 'var(--text-secondary)' : 'var(--text-primary)'),
          marginBottom: '6px',
          opacity: isDisabled ? 0.6 : 1,
          transition: 'all 0.2s',
          boxShadow: active ? '0 4px 15px var(--primary-glow)' : 'none'
        }}
        onMouseEnter={e => { if (!active && !isDisabled) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <div style={{ marginRight: '16px', display: 'flex', alignItems: 'center', flexShrink: 0, color: active ? '#fff' : 'var(--accent-color)' }}>
          {isSub
            ? <img
                src={item.avatar
                  ? (item.avatar.startsWith('http') ? item.avatar : `http://localhost:5001/${item.avatar}`)
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff`}
                alt={item.name}
                referrerPolicy="no-referrer"
                style={{ width: '26px', height: '26px', borderRadius: '8px', objectFit: 'cover' }}
              />
            : item.icon}
        </div>
        <span style={{
          fontSize: '15px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '140px',
          fontFamily: 'Outfit'
        }}>
          {item.name}
        </span>
      </div>
    );
  };

  const SectionTitle = ({ title, showArrow = false }) => (
    <div style={{
      padding: '24px 12px 12px 12px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      display: 'flex',
      alignItems: 'center',
      color: 'var(--text-secondary)',
      fontFamily: 'Outfit'
    }}>
      {title}
      {showArrow && <FaChevronRight size={10} style={{ marginLeft: '8px' }} />}
    </div>
  );

  const Divider = () => (
    <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 12px', opacity: 0.5 }} />
  );

  return (
    <div
      className="sidebar"
      style={{
        width: isOpen ? '260px' : '0px',
        minWidth: isOpen ? '260px' : '0px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: 'calc(100vh - 100px)',
        position: 'sticky',
        top: '90px',
        marginLeft: isOpen ? '20px' : '0',
        backgroundColor: 'rgba(15, 15, 20, 0.45)',
        backdropFilter: 'blur(30px)',
        borderRadius: '24px',
        border: isOpen ? '1px solid var(--border-color)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        overflowY: 'auto',
        flexShrink: 0,
        opacity: isOpen ? 1 : 0,
        boxShadow: isOpen ? '0 10px 40px rgba(0,0,0,0.3)' : 'none'
      }}
    >
      <div style={{
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        padding: '16px 12px',
        minWidth: '220px',
      }}>

        {mainLinks.map(i => renderItem(i))}

        <Divider />

        <SectionTitle title="Learning Paths" />
        {(() => {
            const otherChannels = channels.filter(ch => ch._id?.toString() !== loggedUserId?.toString());
            return otherChannels.length === 0 ? (
              <div style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                No active paths found
              </div>
            ) : (
              otherChannels.map(ch => renderItem(ch, true, `/channel/${ch._id}`))
            );
          })()}

        <Divider />

        <SectionTitle title="Personal Hub" showArrow={true} />
        {youLinks.map(i => renderItem(i))}

        <Divider />

        <SectionTitle title="Global Network" />
        {exploreLinks.map(i => renderItem(i))}

        <div style={{ padding: '24px 12px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '20px' }}>
          Intellectual Property & Copyright<br />
          Terms of Service<br />
          Community Guidelines<br /><br />
          © 2026 Vydora Inc.
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
