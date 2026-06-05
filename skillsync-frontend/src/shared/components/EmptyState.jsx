/**
 * Empty / zero-data placeholder shown inside cards or pages.
 */
export default function EmptyState({ icon = '✨', title, description, action }) {
  return (
    <div className="empty fade-in">
      <div
        aria-hidden
        style={{
          width: 56,
          height: 56,
          margin: '0 auto 14px',
          display: 'grid',
          placeItems: 'center',
          fontSize: 26,
          borderRadius: 16,
          background: 'linear-gradient(135deg, var(--brand-50), var(--brand-100))',
          border: '1.5px solid var(--brand-200)'
        }}
      >
        {icon}
      </div>
      {title && <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>}
      {description && (
        <div style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: 14, maxWidth: 380, marginInline: 'auto' }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
