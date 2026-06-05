/**
 * Glass card. Pass `accent` for a soft brand glow strip across the top.
 */
export default function Card({ children, className = '', accent = false, padding, ...rest }) {
  const style = padding ? { padding, ...rest.style } : rest.style;
  return (
    <div className={`card fade-in ${className}`} {...rest} style={style}>
      {accent && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--brand-400), var(--brand-600), transparent)'
          }}
        />
      )}
      {children}
    </div>
  );
}
