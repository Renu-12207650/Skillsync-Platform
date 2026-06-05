import { useEffect, useMemo, useState } from 'react';

import sessionService from '../../core/services/sessionService.js';
import { useAuth } from '../../core/auth/AuthContext.jsx';
import { useToast } from '../../shared/components/Toast.jsx';

import Card from '../../shared/components/Card.jsx';
import Badge from '../../shared/components/Badge.jsx';
import Button from '../../shared/components/Button.jsx';
import EmptyState from '../../shared/components/EmptyState.jsx';
import Spinner from '../../shared/components/Spinner.jsx';
import { formatDateTime, prettyStatus } from '../../shared/utils/format.js';

const TABS = [
  { key: 'upcoming',  label: 'Upcoming',  match: (s) => ['REQUESTED', 'ACCEPTED'].includes(s.status) },
  { key: 'completed', label: 'Completed', match: (s) => s.status === 'COMPLETED' },
  { key: 'cancelled', label: 'Cancelled', match: (s) => ['CANCELLED', 'REJECTED'].includes(s.status) }
];

const RHYTHM_TIPS = [
  {
    key: 'agenda',
    label: 'Prepare agenda',
    tip: 'Before the call, write down 1–3 outcomes you want by the end. Share them with your mentor 10 minutes early so the conversation lands quickly.'
  },
  {
    key: 'ontime',
    label: 'Join on time',
    tip: 'Open the meeting link 2 minutes early, mute notifications, and have your last week’s notes pulled up. Punctuality compounds trust.'
  },
  {
    key: 'next',
    label: 'Capture next actions',
    tip: 'In the last 5 minutes, agree on 1–2 concrete next actions with deadlines. Write them in the session notes immediately — memory fades fast.'
  }
];

export default function SessionsPage() {
  const { isMentor } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTip, setActiveTip] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const fetcher = isMentor ? sessionService.myAsMentor : sessionService.myAsLearner;
        const page = await fetcher({ size: 50, page: 0 });
        if (active) setSessions(page?.content || []);
      } catch (err) {
        if (active) toast.error(err.userMessage || 'Could not load sessions');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [isMentor, toast]);

  const filtered = useMemo(() => {
    const tabDef = TABS.find((t) => t.key === tab);
    return (sessions || [])
      .filter(tabDef.match)
      .sort((a, b) => new Date(b.sessionDateTime) - new Date(a.sessionDateTime));
  }, [sessions, tab]);

  async function act(id, kind, reason) {
    try {
      let updated;
      if (kind === 'accept')   updated = await sessionService.accept(id);
      if (kind === 'reject')   updated = await sessionService.reject(id, reason);
      if (kind === 'cancel')   updated = await sessionService.cancel(id);
      if (kind === 'complete') updated = await sessionService.complete(id);
      setSessions((curr) => curr.map((s) => s.id === id ? updated : s));
      toast.success(`Session ${kind}ed`);
    } catch (err) {
      toast.error(err.userMessage || `Could not ${kind} session`);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <span className="page-eyebrow">{isMentor ? 'Mentor view' : 'Learner view'}</span>
        <h1 className="page-title">My sessions</h1>
        <p className="page-subtitle">
          {isMentor ? 'Sessions learners have requested with you.' : 'Sessions you’ve booked.'}
        </p>
      </header>

      <div className="row" style={{ gap: 6 }}>
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            className={`chip ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="row between" style={{ gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <span className="page-eyebrow">Session rhythm</span>
            <h3 style={{ marginTop: 4 }}>A good session is specific, short, and leaves the next step obvious.</h3>
            <p className="card-subtitle" style={{ marginTop: 6 }}>Use this page to keep every conversation actionable.</p>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            {RHYTHM_TIPS.map((t) => (
              <button
                type="button"
                key={t.key}
                className={`chip ${activeTip === t.key ? 'is-active' : ''}`}
                onClick={() => setActiveTip((curr) => curr === t.key ? null : t.key)}
                aria-expanded={activeTip === t.key}
                aria-controls="session-rhythm-tip"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {activeTip && (
          <div
            id="session-rhythm-tip"
            role="region"
            aria-live="polite"
            style={{
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-50)',
              borderLeft: '3px solid var(--brand-600)',
              color: 'var(--text-secondary)',
              fontSize: 14,
              lineHeight: 1.55
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>
              {RHYTHM_TIPS.find((t) => t.key === activeTip)?.label}:
            </strong>{' '}
            {RHYTHM_TIPS.find((t) => t.key === activeTip)?.tip}
          </div>
        )}
      </Card>

      {loading ? (
        <Spinner size={36} label="Loading sessions…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⌛"
          title={`No ${tab} sessions`}
          description={tab === 'upcoming' ? 'New sessions will appear here as soon as they’re booked.' : ''}
        />
      ) : (
        <div className="grid grid-2">
          {filtered.map((s) => (
            <Card key={s.id}>
              <div className="row between">
                <strong style={{ fontSize: 15 }}>{formatDateTime(s.sessionDateTime)}</strong>
                <Badge status={s.status} />
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                {s.topic || 'No agenda yet'}
              </p>
              <div className="row" style={{ marginTop: 8, gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{s.durationMinutes} min</span>
                <span>•</span>
                <span>{isMentor ? `Learner #${s.learnerId}` : `Mentor #${s.mentorId}`}</span>
                <span>•</span>
                <span>{prettyStatus(s.status)}</span>
              </div>

              {s.rejectionReason && (
                <p style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>
                  Reason: {s.rejectionReason}
                </p>
              )}

              <div className="row" style={{ marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
                {isMentor && s.status === 'REQUESTED' && (
                  <>
                    <Button size="sm" onClick={() => act(s.id, 'accept')}>Accept</Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      const reason = window.prompt('Why are you rejecting this session?') || '';
                      act(s.id, 'reject', reason);
                    }}>Reject</Button>
                  </>
                )}
                {isMentor && s.status === 'ACCEPTED' && (
                  <Button size="sm" onClick={() => act(s.id, 'complete')}>Mark completed</Button>
                )}
                {!isMentor && ['REQUESTED', 'ACCEPTED'].includes(s.status) && (
                  <Button size="sm" variant="ghost" onClick={() => act(s.id, 'cancel')}>Cancel</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <style>{`
        /* Mobile responsive adjustments */
        @media (max-width: 767px) {
          /* Stack session rhythm card content */
          .page .card .row.between {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .page .card .row.between > div {
            flex: none !important;
            width: 100%;
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

        /* Tablet: 2-column session cards */
        @media (min-width: 768px) and (max-width: 1023px) {
          .grid.grid-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
