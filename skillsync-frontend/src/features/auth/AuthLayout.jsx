import { Link } from 'react-router-dom';
import Logo from '../../shared/components/Logo.jsx';
import ThemeToggle from '../../shared/components/ThemeToggle.jsx';

/**
 * Split-panel layout used by every auth screen.
 * Left side hosts the value prop, right side hosts the form card.
 * Light, warm, peer-to-peer aesthetic.
 */
export default function AuthLayout({ title, subtitle, eyebrow, children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
        alignItems: 'stretch'
      }}
    >
      {/* Brand panel */}
      <aside
        className="brand-panel"
        style={{
          padding: '40px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, var(--brand-700) 0%, var(--brand-500) 45%, var(--brand-400) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* dot pattern overlay */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none'
        }} />
        {/* glow blobs */}
        <div aria-hidden style={{ position: 'absolute', top: '-80px', right: '-80px', width: 320, height: 320, borderRadius: '50%', background: 'rgba(245,158,11,0.18)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 260, height: 260, borderRadius: '50%', background: 'rgba(167,139,250,0.25)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        <div className="row between" style={{ position: 'relative', zIndex: 1, alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <svg width={36} height={36} viewBox="0 0 64 64">
                <rect width="64" height="64" rx="16" fill="rgba(255,255,255,0.15)" />
                <path d="M18 40c4 4 9 6 14 6 5 0 10-2 14-6M18 24c4-4 9-6 14-6 5 0 10 2 14 6" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="32" cy="32" r="4" fill="#F59E0B" />
              </svg>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Skill<span style={{ color: '#FCD34D' }}>Sync</span></strong>
            </span>
          </Link>
          <ThemeToggle compact />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 540, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-pill)', padding: '6px 16px', width: 'fit-content' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.12em' }}>1,200+ peers learning right now</span>
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.08, color: '#FFFFFF' }}>
            Learn one thing.<br />
            Teach another.<br />
            <span style={{ color: '#FCD34D' }}>Grow together.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.80)', fontSize: 16, lineHeight: 1.65 }}>
            SkillSync connects you with real mentors for crisp, human guidance —
            progress you can feel, on a clean workspace that stays out of the way.
          </p>

          <div className="col" style={{ gap: 12, marginTop: 4 }}>
            <Bullet>Two-way trades — fair, real, reciprocal</Bullet>
            <Bullet>Skill-aware matching, not random pairings</Bullet>
            <Bullet>Async chat or video, on your own schedule</Bullet>
          </div>

          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
            alt="Person working"
            style={{ width: '100%', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', aspectRatio: '16/10', objectFit: 'cover', opacity: 0.92, marginTop: 8 }}
          />
        </div>

        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} SkillSync · Built for the curious.
        </div>
      </aside>

      {/* Form panel */}
      <main
        style={{
          padding: '32px 28px',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg-base)',
          minHeight: '100vh',
          maxHeight: '100vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div className="card" style={{
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            border: '1.5px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
              {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--text-primary)' }}>{title}</h2>
              {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </main>

      <style>{`
        /* Tablet: Compact brand panel */
        @media (max-width: 1023px) {
          .brand-panel { padding: 28px 32px !important; }
          .brand-panel h1 { font-size: clamp(26px, 3.2vw, 40px) !important; }
          .brand-panel img { display: none !important; }
        }

        /* Mobile: Hide brand panel, full-width form */
        @media (max-width: 767px) {
          .brand-panel { display: none !important; }
          main {
            grid-column: 1 / -1 !important;
            padding: 20px 16px !important;
            max-height: none !important;
          }
          main .card {
            padding: 24px 20px !important;
            border-radius: var(--radius-lg) !important;
          }
          main h2 { font-size: 22px !important; }
          main .input, main .select { font-size: 16px; padding: 14px 16px; }
        }

        /* Small phones */
        @media (max-width: 359px) {
          main { padding: 12px !important; }
          main .card { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <div className="row" style={{ gap: 10, alignItems: 'flex-start', color: 'rgba(255,255,255,0.90)', fontSize: 14.5 }}>
      <span style={{
        flexShrink: 0,
        marginTop: 2,
        width: 20, height: 20, borderRadius: '50%',
        background: 'var(--accent-500)', color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800
      }}>✓</span>
      <span>{children}</span>
    </div>
  );
}

function Marquee() {
  const skills = [
    'System Design', 'React', 'Spring Boot', 'Kubernetes',
    'Machine Learning', 'Go', 'Product Strategy', 'Rust', 'iOS', 'DSA'
  ];
  return (
    <div className="row wrap" style={{ marginTop: 4, gap: 8 }}>
      {skills.map((s) => (
        <span key={s} className="chip">{s}</span>
      ))}
    </div>
  );
}
