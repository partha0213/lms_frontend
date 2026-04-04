import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { Book, Loader2, Search, Filter, MoreVertical, LayoutGrid, List as ListIcon, ShieldCheck, BookOpen, PlayCircle, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ADMIN_API, TRAINER_API } from '../../config';

const TrainerCourses = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

  useEffect(() => {
    const fetchTrainerCourses = async () => {
      if (!accessToken) return;
      
      const headers = { 
        'Authorization': `Bearer ${accessToken}`, 
        'Accept': 'application/json' 
      };

      try {
        const response = await fetch(`${TRAINER_API}/trainer_course_ids`, { headers });
        if (response.ok) {
          const data = await response.json();
          const ids = data.course_ids || [];
          
          setCourses([]);
          setLoading(false);

          for (const id of ids) {
            try {
              const res = await fetch(`${ADMIN_API}/course/${id}/full-details`, { headers });
              if (res.ok) {
                const detailData = await res.json();
                const c = detailData.course || detailData;
                const newCourse = {
                  ...c,
                  course_id: id,
                  course_title: c.course_title || c.title || 'Untitled Course',
                  course_description: c.course_description || c.description || 'No description available for this course.',
                  is_active: c.is_active || false
                };
                setCourses(prev => {
                  if (prev.some(pc => pc.course_id === id)) return prev;
                  return [...prev, newCourse];
                });
              }
            } catch (e) {
              console.error(`Failed to fetch details for node ${id}`, e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch trainer repository", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerCourses();
  }, [accessToken]);

  const filteredCourses = courses.filter(course => 
    course.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', paddingBottom: '6rem' }}>
      
      {/* COMPACT MODERNISED HEADER */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1.25rem 0' }}>
         <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 var(--page-padding)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>
                  <ShieldCheck size={14} /><span style={{ fontSize: '0.6rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Faculty Node</span>
               </div>
               <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.03em' }}>Course Repository</h2>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search node IDs..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ width: '240px', padding: '0.55rem 1rem 0.55rem 2.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: '0.85rem', fontSize: '0.85rem', fontWeight: 700, outline: 'none', color: 'var(--color-text)' }} 
                  />
                </div>
                
                <div style={{ display: 'flex', backgroundColor: 'var(--color-surface-muted)', padding: '0.25rem', borderRadius: '0.85rem', border: '1px solid var(--color-border)' }}>
                  <button onClick={() => setViewMode('grid')} style={{ padding: '0.45rem 0.65rem', borderRadius: '0.65rem', border: 'none', background: viewMode === 'grid' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', transition: 'all 0.3s' }}><LayoutGrid size={16}/></button>
                  <button onClick={() => setViewMode('list')} style={{ padding: '0.45rem 0.65rem', borderRadius: '0.65rem', border: 'none', background: viewMode === 'list' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', transition: 'all 0.3s' }}><ListIcon size={16}/></button>
                </div>
            </div>
         </div>
      </div>


      {loading ? (
        <div style={{ padding: '8rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.25rem' }}>
           <Loader2 size={32} className="animate-spin" color="var(--color-primary)" />
           <p style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>SYNCING RECORDS...</p>
        </div>
      ) : (
        <div className="arcade-container" style={{ 
          backgroundColor: 'var(--color-surface-muted)', 
          padding: '2rem', 
          borderRadius: '2.5rem', 
          minHeight: '500px'
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-text) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          {filteredCourses.length === 0 ? (
            <div style={{ padding: '6rem', textAlign: 'center' }}>
              <Book size={48} style={{ margin: '0 auto 1.25rem', opacity: 0.1 }} />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 600 }}>No matching courses found in your repository.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid' : ''} style={{ 
              display: viewMode === 'grid' ? 'grid' : 'flex', 
              flexDirection: viewMode === 'list' ? 'column' : 'unset',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'unset', 
              gap: '1.25rem',
              position: 'relative', zIndex: 1
            }}>
              {filteredCourses.map((course) => (
                <motion.div 
                  key={course.course_id} 
                  className="course-glow-card" 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    padding: viewMode === 'grid' ? '1.75rem' : '1.25rem 1.75rem', 
                    display: 'flex', 
                    flexDirection: viewMode === 'grid' ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: viewMode === 'grid' ? 'flex-start' : 'center', 
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
                    borderRadius: '1.75rem', 
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    gap: viewMode === 'grid' ? '1.5rem' : '0'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                      color: '#10b981', 
                      borderRadius: '1rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid rgba(16, 185, 129, 0.15)',
                      flexShrink: 0
                    }}>
                      <BookOpen size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', fontWeight: 950, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                        {course.course_title}
                      </h3>
                      <p style={{ margin: '0 0 0.85rem 0', color: 'var(--color-text-muted)', fontSize: '0.8rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: viewMode === 'grid' ? 2 : 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.course_description}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                           <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Assigned
                        </span>
                        
                        {(() => {
                           const t = (course.course_type || course.type || course.course_Type || 'recorded').toLowerCase();
                           const isLive = t === 'live' || t === 'live_course';
                           return (
                             <span style={{ 
                               backgroundColor: isLive ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface-muted)',
                               color: isLive ? '#ef4444' : 'var(--color-text-muted)',
                               padding: '0.2rem 0.75rem',
                               borderRadius: '2rem',
                               border: `1px solid ${isLive ? 'rgba(239, 68, 68, 0.2)' : 'var(--color-border)'}`
                             }}>
                               • {isLive ? '🔴 LIVE STREAM' : '🎬 RECORDED'}
                             </span>
                           );
                        })()}
                        
                        <span style={{ color: 'var(--color-text-muted)', padding: '0.2rem 0' }}>• ID: {String(course.course_id || course.id).slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', width: viewMode === 'grid' ? '100%' : 'auto', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                      <button 
                        onClick={() => navigate(`/trainer/course/${course.course_id}`)}
                        className="btn btn-secondary" 
                        style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '1rem', fontWeight: 950, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      >
                        <PlayCircle size={15} /> View
                      </button>
                      <button 
                        onClick={() => navigate(`/manage/course/${course.course_id}`)}
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '1rem', fontWeight: 950, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      >
                        <Layers size={15} /> Studio
                      </button>
                    </div>
                    <button style={{ color: 'var(--color-text-muted)', padding: '0.65rem', border: 'none', background: 'var(--color-surface-muted)', borderRadius: '1rem', cursor: 'pointer' }}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .course-glow-card:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: var(--color-primary) !important;
          box-shadow: 0 15px 45px rgba(2, 6, 23, 0.15); /* Light mode navy */
          background-image: linear-gradient(135deg, transparent 95%, rgba(0,0,0,0.02) 100%), radial-gradient(circle at 2px 2px, rgba(0,0,0,0.01) 1px, transparent 0);
          background-size: 100% 100%, 30px 30px;
        }
        .dark .course-glow-card:hover {
          box-shadow: 0 0 50px rgba(255, 255, 255, 0.15); /* Dark mode white glow */
          background-image: linear-gradient(135deg, transparent 95%, rgba(255,255,255,0.05) 100%), radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0);
        }
        .arcade-container {
          position: relative;
        }
        .arcade-container::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 3.5rem;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.03);
          pointer-events: none;
        }
        .dark .arcade-container {
          background-color: rgba(255,255,255,0.01) !important;
          box-shadow: inset 0 10px 30px rgba(0,0,0,0.5) !important;
          border-color: rgba(255,255,255,0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default TrainerCourses;
