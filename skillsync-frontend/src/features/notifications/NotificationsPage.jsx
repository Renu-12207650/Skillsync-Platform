import { useEffect, useState } from 'react';

import notificationService from '../../core/services/notificationService.js';
import Card from '../../shared/components/Card.jsx';
import Badge from '../../shared/components/Badge.jsx';
import EmptyState from '../../shared/components/EmptyState.jsx';
import Spinner from '../../shared/components/Spinner.jsx';
import Button from '../../shared/components/Button.jsx';
import { timeAgo } from '../../shared/utils/format.js';

const INBOX_TIPS = [
  {
    key: 'respond',
    label: 'Respond quickly',
    tip: 'Aim to acknowledge mentor requests within 12 hours. A quick “yes / not this week” is more respectful than a perfect reply two days later.'
  },
  {
    key: 'friction',
    label: 'Reduce friction',
    tip: 'Default to async first. If a question takes < 2 minutes to type, send a message instead of scheduling a call.'
  },
  {
    key: 'momentum',
    label: 'Keep momentum',
    tip: 'Close the loop on every notification within a day — even if it’s just “done”. Stale inboxes silently kill mentoring relationships.'
  }
];

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [activeTip, setActiveTip] = useState(null);

  useEffect(() => {
    let active = true;
    notificationService.myAll()
      .then((all) => active && setItems(Array.isArray(all) ? all : []))
      .catch(() => active && setItems([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function markRead(id) {
    try {
      await notificationService.markAsRead(id);
      setItems((curr) => curr.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch { /* ignore */ }
  }

  const filtered = tab === 'unread' ? items.filter((n) => !n.read) : items;

  return (
    <div className="page">
      <header className="page-header">
        <span className="page-eyebrow">Inbox</span>
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Booking events, mentor approvals and reminders — all in one place.</p>
      </header>

      <div className="row" style={{ gap: 6 }}>
        <button type="button" className={`chip ${tab === 'all' ? 'is-active' : ''}`} onClick={() => setTab('all')}>All</button>
        <button type="button" className={`chip ${tab === 'unread' ? 'is-active' : ''}`} onClick={() => setTab('unread')}>Unread</button>
      </div>

      <Card>
        <div className="row between" style={{ gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <span className="page-eyebrow">Stay in the loop</span>
            <h3 style={{ marginTop: 4 }}>Notifications help you keep sessions, approvals, and follow-ups on track.</h3>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            {INBOX_TIPS.map((t) => (
              <button
                type="button"
                key={t.key}
                className={`chip ${activeTip === t.key ? 'is-active' : ''}`}
                onClick={() => setActiveTip((curr) => curr === t.key ? null : t.key)}
                aria-expanded={activeTip === t.key}
                aria-controls="inbox-tip"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {activeTip && (
          <div
            id="inbox-tip"
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
              {INBOX_TIPS.find((t) => t.key === activeTip)?.label}:
            </strong>{' '}
            {INBOX_TIPS.find((t) => t.key === activeTip)?.tip}
          </div>
        )}
      </Card>

      {loading ? (
        <Spinner size={36} label="Loading notifications…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon="◔" title={tab === 'unread' ? "You're all caught up" : 'No notifications yet'} />
      ) : (
        <div className="col" style={{ gap: 10 }}>
          {filtered.map((n) => (
            <Card key={n.id} style={{ background: n.read ? 'var(--bg-raised)' : 'var(--brand-50)', borderColor: n.read ? 'var(--glass-border)' : 'var(--brand-200)' }}>
              <div className="row between" style={{ alignItems: 'flex-start', gap: 12 }}>
                <div className="col" style={{ gap: 4, flex: 1 }}>
                  <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <strong>{n.title || n.type || 'Notification'}</strong>
                    {!n.read && <Badge tone="warning">Unread</Badge>}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{n.message}</p>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(n.createdAt)}</span>
                </div>
                {!n.read && (
                  <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>
                    Mark as read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <style>{`
        /* Mobile responsive adjustments */
        @media (max-width: 767px) {
          /* Stack inbox tips card */
          .card .row.between {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .card .row.between > div {
            flex: none !important;
            width: 100%;
          }
          /* Notification card full-width actions */
          .card .row button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
