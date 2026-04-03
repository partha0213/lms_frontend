import { useEffect, useState, useCallback, React } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { Book, Users, Video, Clock, Loader2, Activity, ArrowRight, Grid, Calendar, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_API } from '../../config';

// Reusable compact StatCard for Trainer
const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="premium-glow-card" 
    style={{ flex: 1, minWidth: '200px' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ 
        width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', 
        backgroundColor: `${color}15`, color: color, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}30`
      }}>
        {icon}
      </div>
    </div>
    <div>
      <div style={{ 
        fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', 
        letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.35rem' 
      }}>{title}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.03em' }}>{value}</div>
    </div>
  </motion.div>
);

const TrainerDashboard = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrainerData = useCallback(async () => {
    if (!user?.user_id || !accessToken) return;
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' };
    try {
      const [courseRes, sessionRes] = await Promise.all([
        fetch(`${ADMIN_API}/trainer_course_ids`, { headers }),
        fetch(`${ADMIN_API}/instructor/${user.user_id}/live-sessions`, { headers })
      ]);

      if (courseRes.ok) {
        const data = await courseRes.json();
        const ids = data?.course_ids || [];
        const fullCourses = [];
        for (const id of ids) {
          try {
            const res = await fetch(`${ADMIN_API}/course/${id}/full-details`, { headers });
            if (res.ok) {
              const detailData = await res.json();
              const c = detailData.course || detailData;
              fullCourses.push({
                ...c,
                course_id: id,
                course_title: c.course_title || c.title || 'Untitled Node',
                status: c.is_active ? 'live' : 'draft'
              });
            }
          } catch (e) {}
        }
        setCourses(fullCourses);
      }
      
      if (sessionRes.ok) {
        const data = await sessionRes.json();
        setSessions(data.live_sessions || []);
      }
    } catch (err) {
      console.error("Critical architecture sync failure", err);
    } finally {
      setLoading(false);
    }
  }, [user?.user_id, accessToken]);

  useEffect(() => { fetchTrainerData(); }, [fetchTrainerData]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            <Activity size={12} />
            <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Instructor Operations</span>
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Welcome, {user?.name || 'Trainer Node'}</h2>
          <p style={{ margin: 0, maxWidth: '450px', fontSize: '0.8rem' }}>
            Manage your assigned knowledge nodes and upcoming live instruction protocols.
          </p>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard title="Assigned Nodes" value={courses.length} icon={<Book size={20} />} color="var(--color-primary)" delay={0.1} />
        <StatCard title="Active Streams" value={courses.filter(c => c.status === 'live').length} icon={<Users size={20} />} color="#3b82f6" delay={0.2} />
        <StatCard title="Live Schedule" value={sessions.length} icon={<Video size={20} />} color="#8b5cf6" delay={0.3} />
        <StatCard title="Draft Stage" value={courses.filter(c => c.status === 'draft').length} icon={<Grid size={20} />} color="#f59e0b" delay={0.4} />
      </div>

      {loading ? (
        <div style={{ padding: '6rem 0', textAlign: 'center', opacity: 0.5 }}>
           <Loader2 className="animate-spin" style={{ margin: '0 auto 1rem auto' }} size={24} />
           <p style={{ fontWeight: 950, fontSize: '0.7rem', letterSpacing: '0.1em' }}>SYNCHRONIZING REPOSITORY...</p>
        </div>
      ) : (
      <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: ASSIGNED COURSES */}
        <div className="arcade-container" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Active Knowledge Nodes</h3>
            <button onClick={() => navigate('/trainer/courses')} className="btn" style={{ background: 'var(--color-surface)', fontSize: '0.75rem' }}>Full Inventory <ArrowRight size={14} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {courses.length === 0 && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>No modules assigned for your instruction.</p>}
            {courses.map(course => (
              <div 
                key={course.course_id} 
                style={{ 
                  background: 'var(--color-surface)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="tech-badge" style={{ 
                      backgroundColor: course.status === 'live' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: course.status === 'live' ? '#10b981' : '#f59e0b',
                    }}>{course.status}</span>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>{course.course_title}</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ID: {course.course_id}</p>
                </div>
                <button 
                  onClick={() => navigate(`/manage/course/${course.course_id}`)}
                  className="btn btn-primary" 
                  style={{ padding: '0.4rem 1rem', borderRadius: '0.75rem' }}
                >Manage</button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: UPCOMING SESSIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="premium-glow-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <Calendar size={16} /> Live Protocol
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sessions.length === 0 && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', fontSize: '0.8rem' }}>No active streams scheduled.</p>}
              {sessions.map(session => (
                <div 
                  key={session.live_id} 
                  style={{ 
                    display: 'flex', gap: '0.75rem', padding: '0.75rem', 
                    background: 'var(--color-surface-muted)', borderRadius: '1rem',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ textAlign: 'center', borderRight: '1px solid var(--color-border)', paddingRight: '0.75rem', minWidth: '60px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--color-primary)' }}>{new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 800, opacity: 0.5 }}>TIME</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{session.title || 'Instruction Node'}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Status: {session.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-glow-card" style={{ padding: '1.5rem', background: 'var(--navy-950)', color: 'white' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Shield size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure Sandbox</span>
             </div>
             <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
               Your trainer environment is currently synchronized with the cloud registry v2.4.0.
             </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
