/**
 * Round avatar that shows the first letters of `name` or an image when supplied.
 */
export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  const initials = (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const sizeClass = size === 'lg' ? 'avatar-lg' : size === 'sm' ? 'avatar-sm' : '';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={`avatar ${sizeClass} ${className}`}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <span className={`avatar ${sizeClass} ${className}`} aria-label={name}>
      {initials || '?'}
    </span>
  );
}
