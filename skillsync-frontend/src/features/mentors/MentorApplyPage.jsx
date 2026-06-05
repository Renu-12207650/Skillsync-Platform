import { Link } from 'react-router-dom';

import Card from '../../shared/components/Card.jsx';

export default function MentorApplyPage() {
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <Card>
        <div className="col" style={{ gap: 14 }}>
          <span className="page-eyebrow">Mentor onboarding disabled</span>
          <h1 className="page-title" style={{ margin: 0 }}>Apply to become a mentor is no longer available</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Mentor applications are now admin-managed only. If you need mentor access, contact an administrator.
          </p>
          <div className="row" style={{ gap: 10 }}>
            <Link className="btn btn-primary" to="/dashboard">Go to dashboard</Link>
            <Link className="btn btn-ghost" to="/admin">Admin console</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
