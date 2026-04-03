import { useEffect, useState, useCallback, React } from 'react';
import { useAuth } from '../../shared/AuthContext';
import { Video, Calendar, Clock, Users, PlusCircle, Loader2, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { ADMIN_API } from '../../config';

const LiveSessions = () => {
  const { user, accessToken } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user?.user_id || !accessToken) return;
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' };
    try {
      const response = await fetch(`${ADMIN_API}/instructor/${user.user_id}/live-sessions`, { headers });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.live_sessions || []);
      }
    } catch (err) {
      console.error("Live node sync failure", err);
    } finally {
      setLoading(false);
    }
  }, [user?.user_id, accessToken]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto', padding: 'var(--page-padding)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            <Activity size={12} />
            <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transmission Schedule</span>
          </div>
          <h2 style={{ margin: 0 }}>Live Learning Streams</h2>
          <p style={{ margin: '0.25rem 0 0 0', maxWidth: '450px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Schedule and synchronize your interactive virtual classes with actual student nodes.
          </p>
        </div>
        <button className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', borderRadius: '1.15rem' }}>
          <PlusCircle size={16} /> Schedule Session
        </button>
      </div>

      <div className="arcade-container" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-text) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ backgroundColor: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-border)' }}>
              <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 950 }}>Stream Context</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 950 }}>Logical Schedule</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 950 }}>Status</th>
                <th style={{ padding: '1.25rem 2rem', fontWeight: 950, textAlign: 'right' }}>Operations</th>
              </tr>
            </thead>
            <tbody style={{ position: 'relative', zIndex: 1, backgroundColor: 'var(--color-surface)' }}>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '6rem', textAlign: 'center', opacity: 0.5 }}>
                     <Loader2 className="animate-spin" style={{ margin: '0 auto 1.25rem auto' }} size={24} />
                     <p style={{ fontWeight: 950, fontSize: '0.7rem', letterSpacing: '0.1em' }}>SYNCING LIVE NODES...</p>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '6rem', textAlign: 'center', opacity: 0.5 }}>
                     <Video size={48} style={{ margin: '0 auto 1.25rem auto' }} />
                     <p style={{ fontWeight: 950, fontSize: '0.9rem' }}>NO LIVE SESSIONS SCHEDULED</p>
                  </td>
                </tr>
              ) : (
                sessions.map((session, i) => (
                  <tr key={session.live_id} style={{ borderBottom: i === sessions.length - 1 ? 'none' : '1px solid var(--color-border)', transition: 'background 0.3s' }}>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>{session.title || 'Instruction Node'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                         <ShieldCheck size={12} color="var(--color-primary)" /> ID: {session.course_id}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                        <Calendar size={13} style={{ color: 'var(--color-primary)' }} /> {new Date(session.start_time).toLocaleDateString()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                        <Clock size={13} /> {new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <span className="tech-badge" style={{ 
                        backgroundColor: session.status === 'live' ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-muted)',
                        color: session.status === 'live' ? '#10b981' : 'var(--color-text-muted)'
                      }}>{session.status === 'live' ? '● Live' : '● Scheduled'}</span>
                    </td>
                    <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                      <button className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '0.85rem', fontSize: '0.8rem' }}>
                        {session.status === 'live' ? <><Video size={14} /> Start</> : 'Join Registry'}
                      </button>
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

export default LiveSessions;
