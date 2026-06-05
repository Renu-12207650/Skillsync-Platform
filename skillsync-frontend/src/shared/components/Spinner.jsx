export default function Spinner({ size = 24, label = 'Loading…' }) {
  const border = Math.max(2, Math.round(size / 12));
  return (
    <div className="row center" style={{ flexDirection: 'column', gap: 10 }}>
      <span
        role="status"
        aria-label={label}
        style={{
          width: size,
          height: size,
          border: `${border}px solid rgba(255,255,255,0.18)`,
          borderTopColor: 'var(--brand-300)',
          borderRadius: '50%',
          animation: 'spin 700ms linear infinite',
          display: 'inline-block'
        }}
      />
      {label && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</span>}
    </div>
  );
}
