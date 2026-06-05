import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import mentorService from '../../core/services/mentorService.js';
import skillService from '../../core/services/skillService.js';
import userService from '../../core/services/userService.js';
import { useAuth } from '../../core/auth/AuthContext.jsx';

import Avatar from '../../shared/components/Avatar.jsx';
import Badge from '../../shared/components/Badge.jsx';
import Button from '../../shared/components/Button.jsx';
import Spinner from '../../shared/components/Spinner.jsx';
import Card from '../../shared/components/Card.jsx';
import BookSessionModal from '../sessions/BookSessionModal.jsx';
import { formatDate } from '../../shared/utils/format.js';

export default function MentorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLearner } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [profile, setProfile] = useState(null);
  const [skillsById, setSkillsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [m, allSkills] = await Promise.all([
          mentorService.getById(id),
          skillService.list().catch(() => [])
        ]);
        if (!active) return;
        setMentor(m);
        setSkillsById(Object.fromEntries(allSkills.map((s) => [s.id, s])));
        try {
          const p = await userService.getProfile(m.authUserId);
          if (active) setProfile(p);
        } catch { /* mentor may have no profile yet */ }
      } catch (err) {
        if (active) setError(err.userMessage || 'Mentor not found');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="page"><Spinner size={36} label="Loading profile…" /></div>;
  if (error)   return (
    <div className="page">
      <Card>
        <h2>Mentor not found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <div style={{ marginTop: 12 }}><Button onClick={() => navigate('/mentors')}>← Back to browse</Button></div>
      </Card>
    </div>
  );

  const skills = (mentor.skillIds || []).map((sid) => skillsById[sid]?.name).filter(Boolean);
  const displayName = profile?.fullName || `Mentor #${mentor.id}`;

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, var(--brand-700) 0%, var(--brand-500) 60%, var(--brand-400) 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', top: '-50px', right: '-50px', width: 220, height: 220, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="row" style={{ gap: 22, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Avatar size="lg" name={displayName} src={profile?.profileImageUrl} />
          <div className="col" style={{ gap: 6, flex: 1 }}>
            <div className="row" style={{ gap: 10, alignItems: 'center' }}>
              <h1 style={{ fontSize: 28, color: '#FFFFFF' }}>{displayName}</h1>
              <Badge status={mentor.status} />
            </div>
            <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>
              {mentor.yearsOfExperience ?? 0} years of experience
              {profile?.linkedinUrl && (
                <> · <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#86EFAC' }}>LinkedIn</a></>
              )}
              {profile?.githubUrl && (
                <> · <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#86EFAC' }}>GitHub</a></>
              )}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: 12 }}>
              Joined {formatDate(mentor.createdAt)}
            </div>
          </div>
          {isLearner && mentor.status === 'ACTIVE' && (
            <Button size="lg" onClick={() => setBooking(true)} style={{ background: 'var(--accent-500)', borderColor: 'var(--accent-500)', color: '#fff', boxShadow: '0 4px 16px rgba(34,197,94,0.40)' }}>Request session</Button>
          )}
        </div>
      </div>

      <Card>
        <h3>About</h3>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {mentor.bio || (profile?.bio || 'This mentor hasn’t written a bio yet.')}
        </p>
      </Card>

      <Card>
        <h3>Teaches</h3>
        {skills.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No skills listed.</p>
        ) : (
          <div className="row wrap" style={{ gap: 6, marginTop: 12 }}>
            {skills.map((s) => <span key={s} className="chip is-active">{s}</span>)}
          </div>
        )}
      </Card>

      <BookSessionModal
        open={booking}
        mentor={mentor}
        mentorName={displayName}
        onClose={() => setBooking(false)}
      />
    </div>
  );
}
