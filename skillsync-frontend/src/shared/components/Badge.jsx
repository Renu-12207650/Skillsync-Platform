/**
 * Coloured pill badge.
 * Accepts a status string (PENDING_APPROVAL, ACTIVE, REJECTED…) and maps it
 * to a tone, or pass tone directly via the `tone` prop.
 */
const STATUS_TO_TONE = {
  PENDING_APPROVAL: 'warning',
  ACTIVE: 'success',
  APPROVED: 'success',
  ACCEPTED: 'success',
  COMPLETED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'danger',
  REQUESTED: 'muted'
};

export default function Badge({ children, tone, status, className = '' }) {
  const resolvedTone = tone || (status ? STATUS_TO_TONE[status] : undefined);
  const toneClass = resolvedTone ? `badge-${resolvedTone}` : '';
  const label = children ?? (status ? prettyStatus(status) : '');

  return <span className={`badge ${toneClass} ${className}`}>{label}</span>;
}

function prettyStatus(status) {
  return String(status).replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
}
