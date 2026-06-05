import { useEffect, useMemo, useState } from 'react';

import mentorService from '../../core/services/mentorService.js';
import skillService from '../../core/services/skillService.js';
import userService from '../../core/services/userService.js';
import { useAuth } from '../../core/auth/AuthContext.jsx';

import MentorCard from './MentorCard.jsx';
import BookSessionModal from '../sessions/BookSessionModal.jsx';
import { rankMentors, overlapCount } from './matching.js';
import Spinner from '../../shared/components/Spinner.jsx';
import EmptyState from '../../shared/components/EmptyState.jsx';

export default function MentorBrowse() {
  const { user, isLearner } = useAuth();
  const interests = user?.skillInterests || [];

  const [mentors, setMentors] = useState([]);
  const [skills, setSkills] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skillId: '',
    minExperience: '',
    query: ''
  });
  const [bookingFor, setBookingFor] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [skillList, mentorPage] = await Promise.all([
          skillService.list().catch(() => []),
          mentorService.search({ size: 100, page: 0 }).catch(() => ({ content: [] }))
        ]);
        if (!active) return;
        setSkills(skillList);
        setMentors(mentorPage.content || []);

        const ids = (mentorPage.content || []).map((m) => m.authUserId).filter(Boolean);
        const lookup = {};
        await Promise.all(ids.map(async (id) => {
          try { lookup[id] = await userService.getProfile(id); } catch { /* ignore */ }
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

  const filtered = useMemo(() => {
    let list = mentors.filter((m) => m.status === 'ACTIVE');
    if (filters.skillId) {
      const id = Number(filters.skillId);
      list = list.filter((m) => Array.isArray(m.skillIds) && m.skillIds.includes(id));
    }
    if (filters.minExperience) {
      const min = Number(filters.minExperience);
      list = list.filter((m) => (m.yearsOfExperience ?? 0) >= min);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter((m) => {
        const name = (profilesById[m.authUserId]?.fullName || '').toLowerCase();
        const bio  = (m.bio || '').toLowerCase();
        return name.includes(q) || bio.includes(q);
      });
    }
    return rankMentors(list, interests);
  }, [mentors, filters, interests, profilesById]);

  return (
    <div className="page">
      <header className="page-header">
        <span className="page-eyebrow">Mentor discovery</span>
        <h1 className="page-title">Find the right mentor</h1>
        <p className="page-subtitle">
          {filtered.length} of {mentors.filter((m) => m.status === 'ACTIVE').length} active mentors
          {interests.length > 0 && ' · ranked by your skill interests'}.
        </p>
      </header>

      <section className="card">
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
          <div className="field">
            <label className="field-label">Search</label>
            <input
              className="input"
              type="search"
              placeholder="Name or bio…"
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            />
          </div>
          <div className="field">
            <label className="field-label">Skill</label>
            <select
              className="select"
              value={filters.skillId}
              onChange={(e) => setFilters((f) => ({ ...f, skillId: e.target.value }))}
            >
              <option value="">All skills</option>
              {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Min experience</label>
            <select
              className="select"
              value={filters.minExperience}
              onChange={(e) => setFilters((f) => ({ ...f, minExperience: e.target.value }))}
            >
              <option value="">Any</option>
              <option value="1">1+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <Spinner size={40} label="Loading mentors…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="✦"
          title="No mentors match your filters"
          description="Try removing a filter or broadening your search."
        />
      ) : (
        <div className="grid grid-2">
          {filtered.map((m) => (
            <MentorCard
              key={m.id}
              mentor={m}
              fullName={profilesById[m.authUserId]?.fullName}
              skillsById={skillsById}
              matchCount={overlapCount(m, interests)}
              onBook={isLearner ? (mm) => setBookingFor(mm) : undefined}
            />
          ))}
        </div>
      )}

      <BookSessionModal
        open={!!bookingFor}
        mentor={bookingFor}
        mentorName={bookingFor && profilesById[bookingFor.authUserId]?.fullName}
        onClose={() => setBookingFor(null)}
      />

      <style>{`
        /* Responsive filter grid */
        @media (max-width: 767px) {
          section.card .grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          section.card .field {
            width: 100%;
          }
          section.card input,
          section.card select {
            width: 100%;
          }
        }

        /* Tablet: 2-column filters */
        @media (min-width: 768px) and (max-width: 1023px) {
          section.card .grid {
            grid-template-columns: 1fr 1fr !important;
          }
          section.card .field:first-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
}
