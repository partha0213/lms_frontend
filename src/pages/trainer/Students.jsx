import { useEffect, useState, useCallback, React } from 'react';
import { useAuth } from '../../shared/AuthContext';
import { Search, Mail, BookOpen, TrendingUp, Filter, MessageSquare, Loader2, User, ShieldCheck, Activity } from 'lucide-react';
import { ADMIN_API } from '../../config';

const TrainerStudents = () => {
  const { user, accessToken } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = useCallback(async () => {
    if (!user?.user_id || !accessToken) return;
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' };
    try {
      // Predicted endpoint for trainer students
      const response = await fetch(`${ADMIN_API}/instructor/${user.user_id}/students`, { headers });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Student registry sync failure", err);
    } finally {
      setLoading(false);
    }
  }, [user?.user_id, accessToken]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filteredStudents = students.filter(st => 
    (st.name || st.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto', padding: 'var(--page-padding)' }}>
      {/* COMPACT COMMAND HEADER */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            <Activity size={12} />
            <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Learner Intelligence</span>
          </div>
          <h2 style={{ margin: 0 }}>Enrollment Hub</h2>
          <p style={{ margin: '0.25rem 0 0 0', maxWidth: '450px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Real-time synchronization with active student nodes across your courses.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
             <Search size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
             <input 
               type="text" 
               placeholder="Scan student IDs..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               style={{ width: '240px', padding: '0.55rem 1rem 0.55rem 2.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.85rem', fontSize: '0.8rem', fontWeight: 700, outline: 'none' }} 
             />
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.55rem 1rem', borderRadius: '0.85rem', fontSize: '0.8rem' }}>
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      <div className="arcade-container" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-text) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead style={{ backgroundColor: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-border)' }}>
              <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 950 }}>Student Protocol</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 950 }}>Active Link</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 950 }}>Progress Metrics</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 950, textAlign: 'right' }}>Operations</th>
              </tr>
            </thead>
            <tbody style={{ position: 'relative', zIndex: 1, backgroundColor: 'var(--color-surface)' }}>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '6rem', textAlign: 'center', opacity: 0.5 }}>
                     <Loader2 className="animate-spin" style={{ margin: '0 auto 1.25rem auto' }} size={24} />
                     <p style={{ fontWeight: 950, fontSize: '0.7rem', letterSpacing: '0.1em' }}>SYNCING LEARNER REGISTRY...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '6rem', textAlign: 'center', opacity: 0.5 }}>
                     <Users size={48} style={{ margin: '0 auto 1.25rem auto' }} />
                     <p style={{ fontWeight: 950, fontSize: '0.9rem' }}>NO REGISTERED STUDENTS DETECTED</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, i) => (
                  <tr key={st.id || i} style={{ borderBottom: i === filteredStudents.length - 1 ? 'none' : '1px solid var(--color-border)', transition: 'background 0.3s' }}>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ 
                          width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', 
                          backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: '0.9rem'
                        }}>
                          {(st.name || 'S').charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '0.9rem' }}>{st.name || st.username}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                            <Mail size={12} /> {st.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text)', fontSize: '0.8rem', fontWeight: 800 }}>
                        <BookOpen size={13} style={{ color: 'var(--color-primary)' }} /> {st.course_title || 'Active Course'}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ width: '100%', maxWidth: '160px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 950, marginBottom: '0.4rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                           <span>Sync Depth</span>
                           <span style={{ color: 'var(--color-primary)' }}>{st.progress || 0}%</span>
                         </div>
                         <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '1rem', overflow: 'hidden' }}>
                           <div style={{ width: `${st.progress || 0}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '1rem' }} />
                         </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                         <button className="btn btn-secondary" style={{ width: '2rem', height: '2rem', padding: 0, borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Contact Node">
                            <MessageSquare size={14} />
                         </button>
                         <button className="btn btn-secondary" style={{ width: '2rem', height: '2rem', padding: 0, borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Trace Progress">
                            <TrendingUp size={14} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainerStudents;
