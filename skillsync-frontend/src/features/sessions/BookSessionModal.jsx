import { useState } from 'react';

import Modal from '../../shared/components/Modal.jsx';
import Button from '../../shared/components/Button.jsx';
import Input from '../../shared/components/Input.jsx';
import sessionService from '../../core/services/sessionService.js';
import { useToast } from '../../shared/components/Toast.jsx';

const DURATIONS = [30, 45, 60, 90];

/**
 * Multi-step modal that books a mentoring session.
 * Steps: 1) date+time, 2) duration+topic, 3) confirm.
 */
export default function BookSessionModal({ open, onClose, mentor, mentorName, onBooked }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(() => {
    const tomorrow = new Date(Date.now() + 86_400_000);
    return {
      date: tomorrow.toISOString().slice(0, 10),
      time: '10:00',
      duration: 60,
      topic: ''
    };
  });

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function close() {
    setStep(0);
    onClose?.();
  }

  function next() { setStep((s) => Math.min(2, s + 1)); }
  function back() { setStep((s) => Math.max(0, s - 1)); }

  async function submit() {
    setSubmitting(true);
    try {
      const sessionDateTime = new Date(`${form.date}T${form.time}:00`).toISOString();
      const created = await sessionService.book({
        mentorId: mentor.id,
        sessionDateTime,
        durationMinutes: Number(form.duration),
        topic: form.topic
      });
      toast.success('Session requested. The mentor will respond shortly.');
      onBooked?.(created);
      close();
    } catch (err) {
      toast.error(err.userMessage || 'Could not book session');
    } finally {
      setSubmitting(false);
    }
  }

  if (!mentor) return null;

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Request a session with ${mentorName || `Mentor #${mentor.id}`}`}
      size="md"
      footer={
        <>
          {step > 0 && <Button variant="ghost" onClick={back} disabled={submitting}>Back</Button>}
          {step < 2 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            <Button onClick={submit} loading={submitting}>Send request</Button>
          )}
        </>
      }
    >
      <Stepper step={step} />
      <div style={{ marginTop: 18 }}>
        {step === 0 && (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={update('date')}
              min={new Date().toISOString().slice(0, 10)}
            />
            <Input
              label="Start time"
              type="time"
              value={form.time}
              onChange={update('time')}
            />
          </div>
        )}
        {step === 1 && (
          <div className="col" style={{ gap: 14 }}>
            <div className="field">
              <label className="field-label">Duration</label>
              <div className="row wrap" style={{ gap: 6 }}>
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`chip ${Number(form.duration) === d ? 'is-active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, duration: d }))}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="What would you like to cover?"
              as="textarea"
              rows={4}
              placeholder="A brief agenda makes the session 10× more useful…"
              value={form.topic}
              onChange={update('topic')}
            />
          </div>
        )}
        {step === 2 && (
          <div className="card" style={{ background: 'var(--brand-50)', border: '1.5px solid var(--brand-200)' }}>
            <div className="col" style={{ gap: 8 }}>
              <Row label="Mentor" value={mentorName || `Mentor #${mentor.id}`} />
              <Row label="Date" value={new Date(`${form.date}T${form.time}`).toLocaleString()} />
              <Row label="Duration" value={`${form.duration} minutes`} />
              <Row label="Topic" value={form.topic || '—'} />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Stepper({ step }) {
  const steps = ['Pick a time', 'Topic & length', 'Review'];
  return (
    <div className="row" style={{ gap: 8 }}>
      {steps.map((label, i) => (
        <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 22, height: 22, borderRadius: 999,
              display: 'grid', placeItems: 'center',
              background: i <= step ? 'var(--brand-600)' : 'var(--brand-100)',
              color: i <= step ? '#fff' : 'var(--brand-400)',
              border: i === step ? '2px solid var(--accent-500)' : '2px solid transparent',
              fontSize: 11, fontWeight: 700
            }}
          >
            {i + 1}
          </span>
          <span style={{ fontSize: 12, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="row between">
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/* Responsive styles */
const responsiveStyles = `
  @media (max-width: 767px) {
    /* Stack date/time inputs */
    [role="dialog"] .grid[style*="gridTemplateColumns: '1fr 1fr'"] {
      grid-template-columns: 1fr !important;
    }
    /* Smaller stepper labels */
    [role="dialog"] .row span[style*="font-size: 12"] {
      font-size: 11px !important;
    }
    /* Full-width duration chips */
    [role="dialog"] .chip {
      flex: 1;
      text-align: center;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'book-session-modal-responsive';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = responsiveStyles;
    document.head.appendChild(style);
  }
}
