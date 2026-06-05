/**
 * Date / string formatting helpers used across the app.
 */

const DTF_LONG = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const DTF_DATE = new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', year: 'numeric'
});

const RTF = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export function formatDateTime(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return DTF_LONG.format(d);
}

export function formatDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return DTF_DATE.format(d);
}

export function timeAgo(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';

  const diff = (d.getTime() - Date.now()) / 1000;
  const ranges = [
    ['year',   60 * 60 * 24 * 365],
    ['month',  60 * 60 * 24 * 30],
    ['week',   60 * 60 * 24 * 7],
    ['day',    60 * 60 * 24],
    ['hour',   60 * 60],
    ['minute', 60],
    ['second', 1]
  ];
  for (const [unit, secs] of ranges) {
    if (Math.abs(diff) >= secs || unit === 'second') {
      return RTF.format(Math.round(diff / secs), unit);
    }
  }
  return '';
}

export function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Human-friendly status label: "PENDING_APPROVAL" → "Pending approval".
 */
export function prettyStatus(status) {
  if (!status) return '';
  return String(status)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}
