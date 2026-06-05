import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import sessionService from '../../core/services/sessionService.js';
import mentorService from '../../core/services/mentorService.js';
import skillService from '../../core/services/skillService.js';
import { useAuth } from '../../core/auth/AuthContext.jsx';
import { useToast } from '../../shared/components/Toast.jsx';

import Card from '../../shared/components/Card.jsx';
import Badge from '../../shared/components/Badge.jsx';
import Button from '../../shared/components/Button.jsx';
import Spinner from '../../shared/components/Spinner.jsx';
import EmptyState from '../../shared/components/EmptyState.jsx';
import { formatDateTime } from '../../shared/utils/format.js';

export default function MentorDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const [me, page, allSkills] = await Promise.all([
        mentorService.getMyProfile().catch(() => null),
        sessionService.myAsMentor({ size: 20, page: 0 }).catch(() => ({ content: [] })),
        skillService.list().catch(() => [])
      ]);
      if (!active) return;
      setProfile(me);
      setSessions(page.content || []);
      setSkills(allSkills);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  const skillsById = useMemo(() => Object.fromEntries(skills.map((s) => [s.id, s])), [skills]);

  const stats = useMemo(() => ({
    pending: sessions.filter((s) => s.status === 'REQUESTED').length,
    upcoming: sessions.filter((s) => s.status === 'ACCEPTED').length,
    completed: sessions.filter((s) => s.status === 'COMPLETED').length
  }), [sessions]);

  const pending = useMemo(
    () => sessions.filter((s) => s.status === 'REQUESTED').slice(0, 6),
    [sessions]
  );

  async function decide(id, kind, reason) {
    try {
      const updated = kind === 'accept'
        ? await sessionService.accept(id)
        : await sessionService.reject(id, reason);
      setSessions((curr) => curr.map((s) => s.id === id ? updated : s));
      toast.success(`Session ${kind}ed`);
    } catch (err) {
      toast.error(err.userMessage || `Could not ${kind} session`);
    }
  }

  if (loading) return <div className="page"><Spinner size={36} label="Loading mentor workspace…" /></div>;

  return (
    <div className="page">
      <header className="page-header row between" style={{ alignItems: 'flex-end' }}>
        <div>
          <span className="page-eyebrow">Mentor workspace</span>
          <h1 className="page-title">Hi {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">
            {profile?.status === 'PENDING_APPROVAL' && 'Your application is awaiting admin approval.'}
            {profile?.status === 'ACTIVE' && 'You’re live in the mentor catalog. Stay responsive to keep your match score up.'}
            {!profile && 'You haven’t completed your mentor profile yet.'}
          </p>
        </div>
        {profile?.status && <Badge status={profile.status} />}
      </header>

      <section className="grid grid-3">
        <StatCard label="Pending requests" value={stats.pending} icon="⌛" to="/sessions" />
        <StatCard label="Upcoming sessions" value={stats.upcoming} icon="✦" to="/sessions" />
        <StatCard label="Completed sessions" value={stats.completed} icon="✓" to="/sessions" />
      </section>

      <div style={{ background: 'linear-gradient(135deg, var(--brand-700) 0%, var(--brand-500) 60%, var(--brand-400) 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', overflow: 'hidden', position: 'relative' }}>
        <div aria-hidden style={{ position: 'absolute', top: '-40px', right: '-40px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(34,197,94,0.18)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="row between" style={{ gap: 18, alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div className="col" style={{ gap: 10, maxWidth: 560 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-400)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Mentor pulse</span>
            <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>Your best sessions are clear, timely, and specific.</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6 }}>A short, high-signal response beats a long delay. Keep your queue moving.</p>
          </div>
          <img src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80" alt="Mentor workspace preview" style={{ width: 240, height: 165, objectFit: 'cover', borderRadius: 18, boxShadow: '0 16px 48px rgba(0,0,0,0.35)', flexShrink: 0 }} />
        </div>
      </div>

      {profile && (
        <Card>
          <div className="row between" style={{ marginBottom: 12 }}>
            <h3>My mentor profile</h3>
            <Link to="/profile" style={{ fontSize: 13 }}>Edit profile →</Link>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>{profile.bio}</p>
          <div className="row" style={{ gap: 18, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>{profile.yearsOfExperience} yrs experience</span>
            <span>•</span>
            <span>{(profile.skillIds || []).length} skills</span>
          </div>
          {(profile.skillIds || []).length > 0 && (
            <div className="row wrap" style={{ gap: 6, marginTop: 12 }}>
              {profile.skillIds.map((sid) => (
                <span key={sid} className="chip is-active">{skillsById[sid]?.name || `Skill #${sid}`}</span>
              ))}
            </div>
          )}
        </Card>
      )}

      <section>
        <div className="row between" style={{ marginBottom: 14 }}>
          <h2>Pending requests</h2>
          <Link to="/sessions" style={{ fontSize: 13 }}>All sessions →</Link>
        </div>
        {pending.length === 0 ? (
          <EmptyState
            icon="⌛"
            title="No pending requests"
            description="Learners’ booking requests will land here for you to accept or decline."
          />
        ) : (
          <div className="grid grid-2">
            {pending.map((s) => (
              <Card key={s.id}>
                <div className="row between">
                  <strong>{formatDateTime(s.sessionDateTime)}</strong>
                  <Badge status={s.status} />
                </div>
                <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                  {s.topic || 'No agenda yet'}
                </p>
                <div className="row" style={{ marginTop: 6, gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Learner #{s.learnerId}</span>
                  <span>•</span>
                  <span>{s.durationMinutes} min</span>
                </div>
                <div className="row" style={{ marginTop: 12, gap: 8 }}>
                  <Button size="sm" onClick={() => decide(s.id, 'accept')}>Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const reason = window.prompt('Why are you rejecting this session?') || '';
                    decide(s.id, 'reject', reason);
                  }}>Decline</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <style>{`
        /* Mobile responsive adjustments */
        @media (max-width: 767px) {
          /* Stack stat cards */
          .grid.grid-3 {
            grid-template-columns: 1fr !important;
          }
          /* Stack session cards */
          .grid.grid-2 {
            grid-template-columns: 1fr !important;
          }
          /* Full-width action buttons */
          .card .row .btn {
            flex: 1;
          }
        }

        /* Tablet: 2-column stat cards */
        @media (min-width: 768px) and (max-width: 1023px) {
          .grid.grid-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon, to }) {
  const navigate = useNavigate();
  const clickable = !!to;
  return (
    <Card
      role={clickable ? 'link' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => navigate(to) : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter') navigate(to); } : undefined}
      style={clickable ? { cursor: 'pointer' } : undefined}
    >
      <div className="row between">
        <div className="col" style={{ gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--brand-600)', lineHeight: 1 }}>{value}</span>
        </div>
        <div
          aria-hidden
          style={{
            width: 52, height: 52, borderRadius: 16,
            display: 'grid', placeItems: 'center',
            background: 'linear-gradient(135deg, var(--brand-50), var(--brand-100))',
            border: '1.5px solid var(--brand-200)',
            fontSize: 22
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
