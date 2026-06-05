import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../core/auth/AuthContext.jsx';
import mentorService from '../../core/services/mentorService.js';
import skillService from '../../core/services/skillService.js';
import sessionService from '../../core/services/sessionService.js';
import userService from '../../core/services/userService.js';

import Button from '../../shared/components/Button.jsx';
import EmptyState from '../../shared/components/EmptyState.jsx';
import Spinner from '../../shared/components/Spinner.jsx';
import Card from '../../shared/components/Card.jsx';
import Badge from '../../shared/components/Badge.jsx';

import MentorCard from '../mentors/MentorCard.jsx';
import BookSessionModal from '../sessions/BookSessionModal.jsx';
import { rankMentors, overlapCount } from '../mentors/matching.js';
import { formatDateTime, prettyStatus } from '../../shared/utils/format.js';

const PAGE_SIZE = 50;

export default function LearnerDashboard() {
  const { user, setSkillInterests } = useAuth();
  const interests = user?.skillInterests || [];

  const [skills, setSkills] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookingFor, setBookingFor] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [skillList, mentorPage, sessionPage] = await Promise.all([
          skillService.list().catch(() => []),
          mentorService.search({ size: PAGE_SIZE, page: 0 }).catch(() => ({ content: [] })),
          sessionService.myAsLearner({ size: 5, page: 0 }).catch(() => ({ content: [] }))
        ]);
        if (!active) return;
        setSkills(skillList);
        setMentors(mentorPage.content || []);
        setSessions(sessionPage.content || []);

        // Try to fetch the user-profile of each mentor so we can show real names.
        const ids = (mentorPage.content || []).map((m) => m.authUserId).filter(Boolean);
        const lookup = {};
        await Promise.all(ids.map(async (id) => {
          try { lookup[id] = await userService.getProfile(id); } catch { /* best-effort */ }
        }));
        if (active) setProfilesById(lookup);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const skillsById = useMemo(() => Object.fromEntries(skills.map((s) => [s.id, s])), [skills]);

  const recommended = useMemo(() => {
    return rankMentors(mentors, interests, 6).filter((m) => m.status !== 'REJECTED');
  }, [mentors, interests]);

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter((s) => ['REQUESTED', 'ACCEPTED'].includes(s.status))
      .sort((a, b) => new Date(a.sessionDateTime) - new Date(b.sessionDateTime))
      .slice(0, 4);
  }, [sessions]);

  const completedCount = sessions.filter((s) => s.status === 'COMPLETED').length;

  function toggleInterest(id) {
    const next = interests.includes(id) ? interests.filter((x) => x !== id) : [...interests, id];
    setSkillInterests(next);
  }

  if (loading) {
    return <div className="page"><Spinner size={40} label="Loading your dashboard…" /></div>;
  }

  return (
    <div className="page">
      <header className="page-header row between" style={{ alignItems: 'flex-end' }}>
        <div>
          <span className="page-eyebrow">Welcome back</span>
          <h1 className="page-title">Hello {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Your skill journey, mentors and sessions in one place.</p>
        </div>
        <Link to="/mentors" className="btn btn-primary">Find a mentor</Link>
      </header>

      <section className="grid grid-3">
        <StatCard label="Upcoming sessions" value={upcomingSessions.length} icon="⌛" to="/sessions" />
        <StatCard label="Skills tracked" value={interests.length} icon="✦" to="/profile" />
        <StatCard label="Sessions completed" value={completedCount} icon="✓" to="/sessions" />
      </section>

      <div style={{ background: 'linear-gradient(135deg, var(--brand-700) 0%, var(--brand-500) 60%, var(--brand-400) 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', overflow: 'hidden', position: 'relative' }}>
        <div aria-hidden style={{ position: 'absolute', top: '-40px', right: '-40px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(34,197,94,0.18)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="row between" style={{ gap: 18, alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div className="col" style={{ gap: 10, maxWidth: 560 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-400)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Focus for today</span>
            <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>Pick one skill to sharpen, one mentor to message, one session to book.</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6 }}>Small actions keep the learning loop moving. Momentum beats intensity.</p>
          </div>
          <img src="https://thumbs.dreamstime.com/b/man-typing-laptop-ai-concept-top-view-hands-office-double-exposure-brain-hologram-icons-hi-tech-business-toned-149312057.jpg" alt="Focus workspace" style={{ width: 240, height: 165, objectFit: 'cover', borderRadius: 18, boxShadow: '0 16px 48px rgba(0,0,0,0.35)', flexShrink: 0 }} />
        </div>
      </div>

      {/* Skill interests */}
      <Card>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <h3>Your learning interests</h3>
            <p className="card-subtitle">Mentors that teach these skills get prioritised below.</p>
          </div>
          <Link to="/profile" style={{ fontSize: 13 }}>Manage in profile →</Link>
        </div>
        <div className="row wrap" style={{ gap: 6 }}>
          {skills.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Skill catalog is empty — ask an admin to seed it.</span>}
          {skills.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${interests.includes(s.id) ? 'is-active' : ''}`}
              onClick={() => toggleInterest(s.id)}
              aria-pressed={interests.includes(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <section>
        <div className="row between" style={{ marginBottom: 14 }}>
          <div>
            <h2>Recommended for you</h2>
            <p className="page-subtitle">
              {interests.length > 0
                ? 'Ranked by overlap with the skills you want to learn.'
                : 'Pick a few skill interests above to personalise this list.'}
            </p>
          </div>
          <Link to="/mentors" style={{ fontSize: 13 }}>Browse all mentors →</Link>
        </div>

        {recommended.length === 0 ? (
          <EmptyState
            icon="✦"
            title="No mentors yet"
            description="Once mentors register and admins approve them, they'll appear here."
          />
        ) : (
          <div className="grid grid-2">
            {recommended.map((m) => (
              <MentorCard
                key={m.id}
                mentor={m}
                fullName={profilesById[m.authUserId]?.fullName}
                skillsById={skillsById}
                matchCount={overlapCount(m, interests)}
                onBook={(mm) => setBookingFor(mm)}
              />
            ))}
          </div>
        )}
      </section>

      <Card style={{ background: 'linear-gradient(135deg, var(--brand-50), var(--brand-100))', borderColor: 'var(--brand-200)' }}>
        <div className="row between" style={{ gap: 18, flexWrap: 'wrap' }}>
          <div>
            <span className="page-eyebrow">Learning note</span>
            <h3 style={{ marginTop: 4, color: 'var(--text-primary)' }}>You're not behind. You're building a skill stack.</h3>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="chip is-active">Consistent practice</span>
            <span className="chip">Peer feedback</span>
            <span className="chip">Real sessions</span>
          </div>
        </div>
      </Card>

      {/* Upcoming sessions */}
      <section>
        <div className="row between" style={{ marginBottom: 14 }}>
          <h2>Upcoming sessions</h2>
          <Link to="/sessions" style={{ fontSize: 13 }}>All sessions →</Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <EmptyState
            icon="⌛"
            title="No sessions scheduled"
            description="Book a session with one of your recommended mentors to get started."
            action={<Link to="/mentors" className="btn btn-primary btn-sm">Find a mentor</Link>}
          />
        ) : (
          <div className="grid grid-2">
            {upcomingSessions.map((s) => (
              <Card key={s.id}>
                <div className="row between">
                  <strong>{formatDateTime(s.sessionDateTime)}</strong>
                  <Badge status={s.status} />
                </div>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 13 }}>
                  {s.topic || 'Topic to be confirmed'} — {s.durationMinutes} min
                </p>
                <div className="row" style={{ marginTop: 10, gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Mentor #{s.mentorId}</span>
                  <span>•</span>
                  <span>{prettyStatus(s.status)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <BookSessionModal
        open={!!bookingFor}
        mentor={bookingFor}
        mentorName={bookingFor && profilesById[bookingFor.authUserId]?.fullName}
        onClose={() => setBookingFor(null)}
        onBooked={(created) => setSessions((curr) => [created, ...curr])}
      />

      <style>{`
        /* Mobile responsive adjustments */
        @media (max-width: 767px) {
          /* Stack stat cards */
          .grid.grid-3 {
            grid-template-columns: 1fr !important;
          }

          /* Focus card: stack image below text */
          .page .card .row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .page .card img {
            width: 100% !important;
            height: auto !important;
            max-height: 160px;
          }

          /* Interest chips wrap */
          .row.wrap {
            gap: 6px;
          }

          /* Button full width on mobile */
          .page-header .btn {
            width: 100%;
          }

          /* Session cards stack */
          .grid.grid-2 {
            grid-template-columns: 1fr !important;
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
