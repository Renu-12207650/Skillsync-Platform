import { useAuth } from '../../core/auth/AuthContext.jsx';

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useAuth();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      className={compact ? 'btn btn-ghost btn-sm' : 'btn btn-ghost'}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      style={{ gap: 8 }}
    >
      <span aria-hidden>{isLight ? '☾' : '☀'}</span>
      <span>{isLight ? 'Dark' : 'Light'}</span>
    </button>
  );
}