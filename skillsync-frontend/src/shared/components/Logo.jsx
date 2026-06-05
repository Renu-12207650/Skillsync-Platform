/**
 * SkillSync logo mark + wordmark.
 * Set `mark` to render only the icon.
 */
export default function Logo({ mark = false, size = 32 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-label="SkillSync logo">
        <defs>
          <linearGradient id="ssg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#007A64" />
            <stop offset="0.55" stopColor="#009B80" />
            <stop offset="1" stopColor="#3FCBA6" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#ssg)" />
        <path
          d="M18 40c4 4 9 6 14 6 5 0 10-2 14-6M18 24c4-4 9-6 14-6 5 0 10 2 14 6"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="32" cy="32" r="4" fill="#ffffff" />
      </svg>
      {!mark && (
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          Skill<span style={{ color: 'var(--brand-600)' }}>Sync</span>
        </strong>
      )}
    </span>
  );
}
