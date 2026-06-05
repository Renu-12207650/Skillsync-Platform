import { Link } from 'react-router-dom';
import Avatar from '../../shared/components/Avatar.jsx';
import Badge from '../../shared/components/Badge.jsx';
import Button from '../../shared/components/Button.jsx';

/**
 * Card used in the mentor browse grid and dashboard recommendations.
 * Per requirements we don't render hourly_rate or averageRating.
 */
export default function MentorCard({
  mentor,
  skillsById = {},
  matchCount = 0,
  onBook,
  fullName,
  compact = false
}) {
  const skills = (mentor.skillIds || [])
    .map((id) => skillsById[id]?.name)
    .filter(Boolean);
  const displayName = fullName || `Mentor #${mentor.id}`;

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="row" style={{ gap: 14, alignItems: 'center' }}>
        <Avatar size={compact ? 'md' : 'lg'} name={displayName} />
        <div className="col" style={{ gap: 3 }}>
          <h3 style={{ fontSize: compact ? 15 : 17, color: 'var(--text-primary)', fontWeight: 700 }}>{displayName}</h3>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {mentor.yearsOfExperience ?? 0} yrs experience
          </div>
        </div>
        <div className="spacer" />
        {matchCount > 0 && (
          <Badge tone="success">
            {matchCount} skill match{matchCount === 1 ? '' : 'es'}
          </Badge>
        )}
        {mentor.status && mentor.status !== 'ACTIVE' && (
          <Badge status={mentor.status} />
        )}
      </div>

      {!compact && mentor.bio && (
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 14,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {mentor.bio}
        </p>
      )}

      {skills.length > 0 && (
        <div className="row wrap" style={{ gap: 6 }}>
          {skills.slice(0, compact ? 3 : 6).map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
          {skills.length > (compact ? 3 : 6) && (
            <span className="chip">+{skills.length - (compact ? 3 : 6)}</span>
          )}
        </div>
      )}

      <div className="row" style={{ gap: 8, marginTop: 4 }}>
        <Link to={`/mentors/${mentor.id}`} className="btn btn-ghost btn-sm">
          View profile
        </Link>
        {onBook && (
          <Button size="sm" onClick={() => onBook(mentor)}>
            Request session
          </Button>
        )}
      </div>
    </article>
  );
}
