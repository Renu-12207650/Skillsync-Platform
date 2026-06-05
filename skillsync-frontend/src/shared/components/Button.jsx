/**
 * Polymorphic Button used across the app.
 * Variants: primary, ghost, danger.
 * Sizes: sm, md, lg, block.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  type = 'button',
  children,
  leftIcon,
  rightIcon,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    block && 'btn-block',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="spinner" aria-hidden /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
