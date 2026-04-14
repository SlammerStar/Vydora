import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaVideo, FaUserCircle, FaMicrophone } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import VoiceSearchModal from './VoiceSearchModal';

function Navbar({ search, setSearch, toggleSidebar }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [allVideos, setAllVideos] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    setIsListening(true);
  };

  const handleVoiceResult = (transcript) => {
    if (setSearch) setSearch(transcript);
    setShowSearchDropdown(true);
    setIsListening(false);
  };
  
  useEffect(() => {
     fetch('http://localhost:5001/api/video')
       .then(res => res.json())
       .then(data => setAllVideos(data))
       .catch(err => console.log(err));
  }, []);
  const token = localStorage.getItem('token');
  let user = null;
  if (token) {
    try { user = jwtDecode(token); } catch(e){}
  }

  return (
    <div style={{ padding: '20px', position: 'sticky', top: 0, zIndex: 100, pointerEvents: 'none' }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: 'rgba(15, 15, 20, 0.65)',
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        height: '64px',
        maxWidth: '1600px',
        margin: '0 auto',
        pointerEvents: 'auto'
      }}>
         {/* Left */}
         <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div onClick={toggleSidebar} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }} onMouseEnter={(e)=>e.currentTarget.style.color='var(--text-primary)'} onMouseLeave={(e)=>e.currentTarget.style.color='var(--text-secondary)'}>
              <FaBars size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => { if(setSearch) setSearch(''); navigate('/'); }}>
               <div style={{ 
                 background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                 color: 'white', 
                 fontWeight: 'bold',
                 padding: '4px 12px',
                 borderRadius: '12px',
                 marginRight: '8px',
                 fontFamily: 'Outfit',
                 fontSize: '18px',
                 boxShadow: '0 0 15px var(--primary-glow)'
               }}>V</div>
               <span style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>ydora</span>
            </div>
         </div>

         {/* Center - Search */}
         <div style={{
           display: 'flex',
           alignItems: 'center',
           flex: '0 1 540px',
           height: '44px',
           position: 'relative'
         }}>
           <div style={{ position: 'relative', flex: 1, height: '100%' }}>
             <FaSearch size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '14px', zIndex: 2 }} />
             <input
               type="text"
               placeholder="Search..."
               value={search || ''}
               onChange={(e) => {
                   if(setSearch) setSearch(e.target.value);
                   if(e.target.value.length > 0) setShowSearchDropdown(true);
                   else setShowSearchDropdown(false);
               }}
               style={{
                 width: '100%',
                 padding: '0 16px 0 44px',
                 height: '100%',
                 border: '1px solid var(--border-color)',
                 borderRadius: '22px',
                 outline: 'none',
                 fontSize: '15px',
                 backgroundColor: 'rgba(255,255,255,0.03)',
                 color: 'var(--text-primary)',
                 transition: 'all 0.3s ease'
               }}
               onFocus={(e) => {
                   e.target.style.backgroundColor = 'rgba(255,255,255,0.06)';
                   e.target.style.borderColor = 'var(--primary-color)';
                   e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
                   if (search && search.length > 0) setShowSearchDropdown(true);
               }}
               onBlur={(e) => {
                   e.target.style.backgroundColor = 'rgba(255,255,255,0.03)';
                   e.target.style.borderColor = 'var(--border-color)';
                   e.target.style.boxShadow = 'none';
                   setTimeout(() => setShowSearchDropdown(false), 200);
               }}
             />
             {showSearchDropdown && search && (
               <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(15, 15, 20, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 200,
                  padding: '8px 0'
               }}>
                  {allVideos.filter(v => v.title.toLowerCase().includes(search.toLowerCase())).map(v => (
                      <div 
                          key={v._id} 
                          onClick={() => { setShowSearchDropdown(false); if (setSearch) setSearch(''); navigate(`/video/${v._id}`); }}
                          style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                          <FaSearch size={14} color="var(--primary-color)" />
                          <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '500' }}>{v.title}</span>
                      </div>
                  ))}
               </div>
             )}
           </div>
           
           <div 
             onClick={startVoiceSearch}
             style={{
               width: '44px',
               height: '44px',
               borderRadius: '50%',
               backgroundColor: isListening ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               cursor: 'pointer',
               border: '1px solid var(--border-color)',
               marginLeft: '12px',
               flexShrink: 0,
               transition: 'all 0.3s',
               boxShadow: isListening ? '0 0 15px var(--primary-glow)' : 'none'
             }}
             onMouseEnter={e => { if(!isListening) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)' }}
             onMouseLeave={e => { if(!isListening) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
             title="Search with audio"
           >
             <FaMicrophone size={16} color={isListening ? 'white' : 'var(--text-primary)'} />
           </div>
         </div>

         {/* Right */}
         <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
           {token ? (
             <>
               <div 
                 onClick={() => navigate('/upload')} 
                 style={{ 
                   cursor: 'pointer', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center', 
                   width: '40px', 
                   height: '40px', 
                   borderRadius: '50%',
                   backgroundColor: 'transparent',
                   transition: 'all 0.2s'
                 }} 
                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} 
                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                 title="Upload Content"
               >
                 <FaVideo size={20} color="var(--text-primary)"/>
               </div>
               
               <div style={{ position: 'relative' }}>
                  <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`} 
                    alt="Avatar"
                    referrerPolicy="no-referrer" 
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{ 
                      width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover',
                      border: '2px solid transparent',
                      transition: 'border 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                  />
                  
                  {showDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '50px',
                      right: 0,
                      width: '220px',
                      backgroundColor: 'rgba(20, 20, 25, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      zIndex: 300
                    }}>
                      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(to bottom, rgba(124, 58, 237, 0.1), transparent)' }}>
                         <div style={{ fontWeight: '600', fontSize: '16px' }}>{user?.name}</div>
                         <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{user?.email}</div>
                      </div>
                      <div 
                        onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                        style={{ padding: '14px 16px', cursor: 'pointer', transition: 'background 0.2s', fontWeight: '500' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >Creator Studio</div>
                      <div 
                        onClick={() => { setShowDropdown(false); navigate('/my-videos'); }}
                        style={{ padding: '14px 16px', cursor: 'pointer', transition: 'background 0.2s', fontWeight: '500' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >My Content</div>
                      <div 
                        onClick={() => { setShowDropdown(false); navigate('/history'); }}
                        style={{ padding: '14px 16px', cursor: 'pointer', transition: 'background 0.2s', fontWeight: '500' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >Watch History</div>
                      <div 
                        onClick={() => { setShowDropdown(false); navigate('/watch-later'); }}
                        style={{ padding: '14px 16px', cursor: 'pointer', transition: 'background 0.2s', fontWeight: '500' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >Queue</div>
                      <div 
                        onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
                        style={{ padding: '14px 16px', cursor: 'pointer', borderTop: '1px solid var(--border-color)', transition: 'background 0.2s', color: '#f87171', fontWeight: '500' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >Sign out</div>
                    </div>
                  )}
               </div>
             </>
           ) : (
             <div 
               onClick={() => navigate('/login')}
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px',
                 padding: '8px 20px',
                 background: 'linear-gradient(135deg, var(--primary-color), #5b21b6)',
                 color: 'white',
                 borderRadius: '20px',
                 cursor: 'pointer',
                 fontWeight: '600',
                 boxShadow: '0 4px 15px var(--primary-glow)',
                 transition: 'transform 0.2s'
               }}
               onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
             >
               <FaUserCircle size={18} />
               <span>Log In</span>
             </div>
           )}
         </div>
         {isListening && (
           <div style={{ pointerEvents: 'auto' }}>
             <VoiceSearchModal 
               onClose={() => setIsListening(false)} 
               onResult={handleVoiceResult} 
             />
           </div>
         )}
      </nav>
    </div>
  );
}

export default Navbar;
