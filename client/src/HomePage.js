import React, { useEffect, useState, useRef, useCallback } from 'react';
import VideoCard from './components/VideoCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function HomePage({ search }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const observer = useRef();
  const categoryScrollRef = useRef(null);

  const limit = 8; // items per load

  const categories = [
    "All", "Science", "Chemistry", "Space", "Compiler Design", "Full Stack Development", "Robotics", "Operating Systems", "Databases",
    "Machine Learning", "AI", "Podcasts", "Web Development",
    "Data Structures", "Relax"
  ];

  const categoryKeywords = {
    "Science": ["science", "physics", "biology", "earth", "chemistry", "periodic"],
    "Chemistry": ["chemistry", "reaction", "acid", "molecule", "science", "periodic table"],
    "Space": ["space", "universe", "planet", "galaxy", "science", "earth"],
    "Compiler Design": ["compiler", "parsing", "syntax", "grammar", "coding lessons", "operating system"],
    "Full Stack Development": ["code", "react", "node", "development", "full stack", "frontend", "backend", "web dev", "coding lessons", "operating system"],
    "Robotics": ["robot", "arduino", "motor", "automation"],
    "Operating Systems": ["os", "linux", "kernel", "memory", "paging", "operating system", "coding lessons"],
    "Databases": ["database", "sql", "mongo", "nosql", "query"],
    "Machine Learning": ["ml", "model", "training", "dataset", "prediction"],
    "AI": ["ai", "artificial intelligence", "neural", "gpt"],
    "Podcasts": ["podcast", "interview", "discussion", "talk"],
    "Web Development": ["web", "html", "css", "javascript", "browser"],
    "Data Structures": ["array", "linked list", "tree", "graph", "algorithm"],
    "Relax": ["relax", "lofi", "chill", "music", "ambient"]
  };

  useEffect(() => {
    fetch('http://localhost:5001/api/video')
      .then(res => res.json())
      .then(data => {
        setVideos(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const lastVideoElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    }, { threshold: 0.5 });
    if (node) observer.current.observe(node);
  }, [loading]);

  const baseFiltered = videos.filter(v => {
    const searchMatch = v.title.toLowerCase().includes((search || '').toLowerCase());
    let catMatch = true;
    if (activeCategory !== "All") {
      const keywords = categoryKeywords[activeCategory] || [activeCategory.toLowerCase()];
      const text = (v.title + " " + (v.description || "")).toLowerCase();
      catMatch = keywords.some(kw => text.includes(kw));
    }
    return searchMatch && catMatch;
  });

  const displayedVideos = [];
  if (baseFiltered.length > 0) {
    // Determine how many items to display based on the infinite scroll page multiplier.
    // If the true filtered array is smaller, we'll repeat them cleanly as requested for endless emulation.
    const totalDisplayCount = Math.max(baseFiltered.length, page * limit);
    for (let i = 0; i < totalDisplayCount; i++) {
      displayedVideos.push(baseFiltered[i % baseFiltered.length]);
    }
  }

  return (
    <div style={{
      padding: '24px 32px',
      backgroundColor: 'transparent',
      minHeight: '100%'
    }}>

      {/* Hero Section if no search */}
      {!search && displayedVideos.length > 0 && !loading && activeCategory === 'All' && (
        <div style={{
           display: 'grid',
           gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
           gap: '24px',
           marginBottom: '40px'
        }}>
           <div style={{ gridColumn: '1 / span 2', marginBottom: '10px' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '28px', margin: 0, color: 'var(--text-primary)', borderBottom: '2px solid var(--primary-color)', display: 'inline-block', paddingBottom: '8px' }}>
                 Trending Today
              </h2>
           </div>
           
           {/* Featured Video (Large) */}
           <div style={{ gridColumn: '1' }}>
             <VideoCard video={displayedVideos[0]} layout="grid" delete={null} />
           </div>
           
           {/* Secondary Featured stack */}
           <div style={{ gridColumn: '2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {displayedVideos.slice(1, 3).map((video) => (
                <VideoCard key={video._id} video={video} layout="list" />
             ))}
           </div>
        </div>
      )}

      {/* Category Chips - Prism Style */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '24px', paddingBottom: '8px' }}>
        <button 
          onClick={() => categoryScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })}
          style={{ 
            position: 'absolute', left: 0, zIndex: 10, 
            background: 'linear-gradient(to right, rgba(5,5,10,1) 40%, transparent)', 
            border: 'none', height: '100%', padding: '0 20px 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <FaChevronLeft size={16} color="var(--text-primary)" />
          </div>
        </button>

        <div 
          ref={categoryScrollRef}
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth',
            padding: '0 30px'
          }}
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setPage(1); }}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                whiteSpace: 'nowrap',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                color: activeCategory === cat ? 'white' : 'var(--text-primary)',
                boxShadow: activeCategory === cat ? '0 4px 15px var(--primary-glow)' : 'none',
                fontFamily: 'Outfit'
              }}
              onMouseEnter={(e) => { if(activeCategory !== cat) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={(e) => { if(activeCategory !== cat) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <button 
          onClick={() => categoryScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })}
          style={{ 
            position: 'absolute', right: 0, zIndex: 10, 
            background: 'linear-gradient(to left, rgba(5,5,10,1) 40%, transparent)', 
            border: 'none', height: '100%', padding: '0 0 0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <FaChevronRight size={16} color="var(--text-primary)" />
          </div>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '32px 24px'
      }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '20px', marginBottom: '16px' }}></div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '12px' }}></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '90%', height: '18px', borderRadius: '4px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '60%', height: '14px', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          ))
        ) : displayedVideos.length === 0 ? (
          <h3 style={{ textAlign: "center", gridColumn: "1/-1", color: 'var(--text-secondary)', marginTop: '40px', fontFamily: 'Outfit' }}>
            No knowledge bases found for this category
          </h3>
        ) : (
          (search || activeCategory !== 'All' ? displayedVideos : displayedVideos.slice(3)).map((video, index) => {
            const arr = search || activeCategory !== 'All' ? displayedVideos : displayedVideos.slice(3);
            const isLast = index === arr.length - 1;
            return (
              <div ref={isLast ? lastVideoElementRef : null} key={`${video._id}-${index}`}>
                <VideoCard video={video} />
              </div>
            );
          })
        )}
      </div>

      {/* Loading Spinner for Endless Scroll visually */}
      {displayedVideos.length > 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Loading more...
        </div>
      )}
    </div>
  );
}

export default HomePage;
