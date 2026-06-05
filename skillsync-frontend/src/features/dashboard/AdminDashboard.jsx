import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import mentorService from '../../core/services/mentorService.js';
import skillService from '../../core/services/skillService.js';
import userService from '../../core/services/userService.js';
import supportService from '../../core/services/supportService.js';

import Card from '../../shared/components/Card.jsx';
import Spinner from '../../shared/components/Spinner.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, mentors: 0, pending: 0, skills: 0, openTickets: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [users, mentors, pending, skills, support] = await Promise.all([
        userService.listProfiles().catch(() => []),
        mentorService.search({ size: 200 }).catch(() => ({ content: [] })),
        mentorService.pending({ size: 50 }).catch(() => ({ content: [] })),
        skillService.list().catch(() => []),
        supportService.listAll('OPEN').catch(() => [])
      ]);
      if (!active) return;
      setStats({
        users:       users.length || 0,
        mentors:     mentors.content?.length || 0,
        pending:     pending.content?.length || 0,
        skills:      skills.length || 0,
        openTickets: Array.isArray(support) ? support.filter((s) => s.status === 'OPEN').length : 0
      });
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="page"><Spinner size={36} label="Loading platform stats…" /></div>;

  return (
    <div className="page">
      <header className="page-header row between" style={{ alignItems: 'flex-end' }}>
        <div>
          <span className="page-eyebrow">Admin overview</span>
          <h1 className="page-title">Platform health</h1>
          <p className="page-subtitle">High-level metrics. Drill into the admin console for actions.</p>
        </div>
        <Link to="/admin" className="btn btn-primary">Open admin console</Link>
      </header>

      <section className="grid grid-4">
        <Stat label="Total users"          value={stats.users}       to="/admin?tab=users" />
        <Stat label="Active mentors"       value={stats.mentors}     to="/admin?tab=mentors" />
        <Stat label="Pending applications" value={stats.pending}     to="/admin?tab=mentors" tone="warning" />
        <Stat label="Skills in catalog"    value={stats.skills}      to="/admin?tab=skills" />
        <Stat label="Open support tickets" value={stats.openTickets} to="/admin?tab=support" tone={stats.openTickets > 0 ? 'warning' : undefined} />
      </section>

      <Card>
        <div className="row between" style={{ gap: 18, flexWrap: 'wrap' }}>
          <div>
            <span className="page-eyebrow">Admin note</span>
            <h3 style={{ marginTop: 4 }}>Keep the catalog fresh, the queue moving, and the feedback loop visible.</h3>
            <p className="card-subtitle" style={{ marginTop: 6 }}>Operational clarity makes the platform feel alive, not abandoned.</p>
          </div>
          <img src="/illustrations/hero-workspace.svg" alt="Platform overview" style={{ width: 290, borderRadius: 22 }} />
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone, to }) {
  const navigate = useNavigate();
  const color = tone === 'warning' ? 'var(--warning)' : 'var(--brand-300)';
  const clickable = !!to;
  return (
    <Card
      accent
      role={clickable ? 'link' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => navigate(to) : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter') navigate(to); } : undefined}
      style={clickable ? { cursor: 'pointer' } : undefined}
    >
      <span className="page-eyebrow">{label}</span>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </Card>
  );
}
