import { Link } from 'react-router-dom';
import Logo from '../../shared/components/Logo.jsx';
import ThemeToggle from '../../shared/components/ThemeToggle.jsx';

/**
 * Public marketing landing page. Shown to logged-out visitors at /.
 * Skill-swap inspired: warm, conversational, peer-to-peer feel.
 */
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* === Top nav === */}
      <header
        style={{
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1240,
          margin: '0 auto',
          width: '100%'
        }}
      >
        <Logo />
        <nav className="row" style={{ gap: 18, alignItems: 'center' }}>
          <a href="#how" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>How it works</a>
          <a href="#why" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Why SkillSync</a>
          <a href="#voices" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Community</a>
          <Link to="/auth/login" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Sign in</Link>
          <Link to="/auth/register" className="btn btn-primary btn-sm">Join free</Link>
          <ThemeToggle compact />
        </nav>
      </header>

      {/* === Hero === */}
      <section
        className="hero-stripe"
        style={{
          padding: '72px 32px 48px',
          maxWidth: 1240,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 64,
          alignItems: 'center',
          position: 'relative'
        }}
      >
        {/* Decorative blobs */}
        <div className="hero-blob" style={{ width: 340, height: 340, top: -90, right: -40,
          background: 'radial-gradient(closest-side, rgba(0, 184, 150, 0.28), transparent 70%)' }} />
        <div className="hero-blob" style={{ width: 300, height: 300, bottom: -100, left: -60,
          background: 'radial-gradient(closest-side, rgba(34, 197, 94, 0.18), transparent 70%)' }} />

        <div className="col" style={{ gap: 22, position: 'relative', zIndex: 1 }}>
          <span className="tag-pill"><span className="dot" /> Cohort #14 · 1,200 peers learning right now</span>

          <h1 style={{ fontSize: 'clamp(40px, 5.4vw, 68px)', fontWeight: 700, lineHeight: 1.04, maxWidth: 620 }}>
            Grow your skills<br />
            with real people<br />
            <span className="gradient-text" style={{ fontStyle: 'italic' }}>not passive content.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 540, lineHeight: 1.6 }}>
            SkillSync is a clean, modern workspace for swapping expertise —
            you teach what you know, learn what you need, and book real progress.
          </p>
          <div className="row" style={{ gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            <Link to="/auth/register" className="btn btn-primary btn-lg">Start learning now</Link>
            <Link to="/auth/login" className="btn btn-ghost btn-lg">I already have an account</Link>
          </div>
          <div className="row" style={{ marginTop: 16, gap: 22, color: 'var(--text-muted)', fontSize: 13, flexWrap: 'wrap' }}>
            <span>✓ Free forever for learners</span>
            <span>✓ 30+ skills, growing weekly</span>
            <span>✓ 1-on-1 video sessions</span>
          </div>
        </div>

        {/* Demo card */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="card" style={{
            padding: 16,
            borderRadius: '34px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.96), rgba(240,245,255,0.92))'
          }}>
            <div style={{ position: 'relative' }}>
              <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="Team collaborating around a laptop"
                style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 26, display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, borderRadius: 26, background: 'linear-gradient(135deg, rgba(33, 86, 217, 0.12), rgba(255,255,255,0.02))' }} />
            </div>
          </div>
          <div className="card" style={{
            padding: 22,
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            transform: 'rotate(-1.2deg)'
          }}>
            <div className="row between" style={{ marginBottom: 16 }}>
              <div className="col" style={{ gap: 2 }}>
                <span className="page-eyebrow">Live match</span>
                <h3 className="serif" style={{ fontSize: 20 }}>This week's swap</h3>
              </div>
              <span className="badge badge-success">Match · 92%</span>
            </div>

            <div className="col" style={{ gap: 12 }}>
              <SwapCard
                avatar="JS" tone="teal"
                name="Jane Sun"
                offer="System Design"
                want="Product Strategy"
              />
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 22 }}>↕</div>
              <SwapCard
                avatar="AK" tone="coral"
                name="You"
                offer="Product Strategy"
                want="System Design"
              />
            </div>

            <button className="btn btn-accent btn-block" style={{ marginTop: 16 }}>Book intro session →</button>
          </div>

          {/* Floating stat cards */}
          <div className="card" style={{
            position: 'absolute', top: -20, left: -28, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            transform: 'rotate(-3deg)', boxShadow: 'var(--shadow-md)'
          }}>
            <span style={{ fontSize: 22 }}>🤝</span>
            <div className="col" style={{ gap: 0 }}>
              <strong style={{ fontSize: 13 }}>4,800+</strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>swaps completed</span>
            </div>
          </div>
          <div className="card" style={{
            position: 'absolute', bottom: -18, right: -16, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            transform: 'rotate(2.5deg)', boxShadow: 'var(--shadow-md)'
          }}>
            <span style={{ fontSize: 22 }}>⭐</span>
            <div className="col" style={{ gap: 0 }}>
              <strong style={{ fontSize: 13 }}>4.9 / 5</strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>average rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* === Trusted by row === */}
      <section style={{ padding: '12px 32px 40px', maxWidth: 1240, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 18 }}>
          Peers from teams at
        </div>
        <div className="row wrap" style={{ justifyContent: 'center', gap: 32, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontSize: 18, opacity: 0.7 }}>
          <span>Stripe</span>
          <span>Atlassian</span>
          <span>Razorpay</span>
          <span>Vercel</span>
          <span>Notion</span>
          <span>Zoho</span>
        </div>
      </section>

      {/* === How it works === */}
      <section id="how" className="section" style={{ background: 'var(--bg-deep)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px' }}>
          <div className="col" style={{ gap: 12, textAlign: 'center', marginBottom: 56 }}>
            <span className="eyebrow">How it works</span>
            <h2 className="section-title">Three steps, zero gatekeeping.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 620, margin: '0 auto' }}>
              You already know enough to teach someone. SkillSync just helps you find them.
            </p>
          </div>

          <div className="steps-flex" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Step n={1} icon="✏️" title="Tell us what you know"
                  body="List the skills you can teach — even at a beginner level. Think 'I figured out X the hard way' more than 'I'm an expert in X'." />
            <Step n={2} icon="🔍" title="Tell us what you want"
                  body="Pick the skills you're hungry to grow in. Our matcher pairs people with overlap so both sides have something to give." />
            <Step n={3} icon="💬" title="Swap, on your time"
                  body="Async chat, scheduled video calls, or both. No instructors, no homework — just two humans figuring it out together." />
          </div>
          <div className="card" style={{ marginTop: 28, padding: 24, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18, alignItems: 'center' }}>
            <div>
              <span className="page-eyebrow">Why it feels different</span>
              <h3 className="serif" style={{ fontSize: 28, marginTop: 6 }}>Designed like a premium product, not a form stack.</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
                SkillSync keeps the experience human: short loops, clear actions, and enough context to stay inspired.
              </p>
            </div>
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="Professional workspace"
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* === Why SkillSync (feature blocks) === */}
      <section id="why" className="section">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <div className="col" style={{ gap: 12, marginBottom: 48, maxWidth: 720 }}>
            <span className="eyebrow">Why SkillSync</span>
            <h2 className="section-title">Built for the people who already <span style={{ fontStyle: 'italic' }}>do</span> the work.</h2>
          </div>

          <div className="grid grid-2" style={{ gap: 24 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ padding: 28 }}>
                <span className={`feature-icon ${f.tone}`} aria-hidden>{f.icon}</span>
                <h3 className="serif" style={{ fontSize: 22, marginTop: 14, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Skills marquee === */}
      <section style={{ padding: '20px 0 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <div className="col" style={{ gap: 8, textAlign: 'center', marginBottom: 24 }}>
            <span className="eyebrow">Skills you can swap</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px, 2.8vw, 34px)' }}>
              From {`"I just started"`} to {`"I built that"`}
            </h2>
          </div>
          <div className="row wrap" style={{ gap: 8, justifyContent: 'center' }}>
            {SKILL_CHIPS.map((s) => (
              <span key={s} className="chip" style={{ fontSize: 13, padding: '8px 16px' }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* === Voices / testimonials === */}
      <section id="voices" className="section" style={{ background: 'var(--bg-deep)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <div className="col" style={{ gap: 12, textAlign: 'center', marginBottom: 40 }}>
            <span className="eyebrow">Community voices</span>
            <h2 className="section-title">What folks actually say.</h2>
          </div>
          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch' }}>
            {QUOTES.map((q) => (
              <figure key={q.author} className="card" style={{
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 260,
                margin: 0
              }}>
                <p style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  fontStyle: 'italic',
                  borderLeft: '3px solid var(--brand-600)',
                  paddingLeft: 16,
                  margin: 0,
                  flex: 1
                }}>&ldquo;{q.quote}&rdquo;</p>
                <figcaption className="row" style={{ gap: 12, alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--brand-100)' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: q.tone, color: '#fff',
                    display: 'grid', placeItems: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0
                  }}>{q.initials}</div>
                  <div className="col" style={{ gap: 2 }}>
                    <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{q.author}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{q.role}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* === Final CTA === */}
      <section className="section" style={{ paddingBottom: 80 }}>
        <div className="card" style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: 'clamp(36px, 5vw, 64px)',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, var(--brand-500) 0%, var(--brand-600) 60%, var(--accent-600) 130%)',
          color: '#fff',
          border: 'none'
        }}>
          <h2 className="section-title" style={{ color: '#fff' }}>
            Your future self has already started.
          </h2>
          <p style={{ marginTop: 14, fontSize: 17, opacity: 0.9, maxWidth: 540, marginInline: 'auto' }}>
            Pick a skill you want to learn. Pick one you can teach. The match happens in under 60 seconds.
          </p>
          <div className="row" style={{ gap: 12, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
            <Link to="/auth/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--brand-700)' }}>
              Create my profile →
            </Link>
            <Link to="/auth/login" className="btn btn-ghost btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.45)' }}>
              I already have one
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ padding: '32px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <div className="row" style={{ justifyContent: 'center', gap: 22, marginBottom: 10, flexWrap: 'wrap' }}>
          <span>© {new Date().getFullYear()} SkillSync</span>
          <a href="#how">How it works</a>
          <a href="#why">Why us</a>
          <a href="#voices">Community</a>
          <Link to="/auth/login">Sign in</Link>
        </div>
        <div>Made for the curious. Built by the same.</div>
      </footer>

      <style>{`
        @media (max-width: 880px) {
          section[style*="grid-template-columns: 1.1fr 1fr"] {
            grid-template-columns: 1fr !important;
            padding-top: 40px !important;
          }
          header nav a:nth-child(1),
          header nav a:nth-child(2),
          header nav a:nth-child(3) { display: none; }
        }
        /* Testimonials — stack to 1 col on tablet/mobile */
        @media (max-width: 860px) {
          #voices .testimonials-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 600px) and (max-width: 860px) {
          #voices .testimonials-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        /* Steps — stack on mobile */
        @media (max-width: 767px) {
          .steps-flex { flex-direction: column !important; align-items: center !important; }
          .steps-flex > div { width: 100% !important; flex: none !important; }
        }
      `}</style>
    </div>
  );
}

function SwapCard({ avatar, name, offer, want, tone }) {
  const bg = tone === 'coral'
    ? 'linear-gradient(135deg, var(--accent-400), var(--accent-600))'
    : 'linear-gradient(135deg, var(--brand-400), var(--brand-700))';
  return (
    <div className="row" style={{
      gap: 12, alignItems: 'center',
      background: 'rgba(28, 35, 50, 0.04)',
      borderRadius: 'var(--radius-md)',
      padding: 12
    }}>
      <div className="avatar" style={{ background: bg }}>{avatar}</div>
      <div className="col" style={{ gap: 2, flex: 1 }}>
        <strong style={{ fontSize: 14 }}>{name}</strong>
        <div className="row" style={{ gap: 6, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          <span><strong style={{ color: 'var(--brand-600)' }}>Offers:</strong> {offer}</span>
          <span>·</span>
          <span><strong style={{ color: 'var(--accent-600)' }}>Wants:</strong> {want}</span>
        </div>
      </div>
    </div>
  );
}

function Step({ n, icon, title, body }) {
  return (
    <div className="card" style={{
      padding: '32px 28px',
      position: 'relative',
      width: 300,
      minWidth: 260,
      flex: '0 0 300px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }}>
      <div style={{
        position: 'absolute', top: 18, right: 22,
        fontFamily: 'var(--font-display)', fontSize: 64,
        fontWeight: 800, color: 'rgba(0, 122, 100, 0.08)', lineHeight: 1,
        userSelect: 'none'
      }}>{n}</div>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: 'linear-gradient(135deg, var(--brand-50), var(--brand-100))',
        border: '1.5px solid var(--brand-200)',
        display: 'grid', placeItems: 'center',
        fontSize: 24, marginBottom: 18
      }} aria-hidden>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: 14 }}>{body}</p>
    </div>
  );
}

const FEATURES = [
  {
    icon: '🤝', tone: '',
    title: 'Two-way value, not one-way lectures',
    desc: 'Every match has both sides offering something. You teach, you learn — and the other person does too. Real reciprocity, no hierarchy.'
  },
  {
    icon: '⚡', tone: 'coral',
    title: 'Skill-aware matching',
    desc: 'Tell us the skills you bring and the ones you want. Our matcher surfaces peers where the overlap is symmetric — fair trades, every time.'
  },
  {
    icon: '🗣️', tone: '',
    title: 'Async-first, video when it counts',
    desc: 'Trade voice notes, drop screen recordings, jump on a call only when the chat needs more nuance. No calendar tetris.'
  },
  {
    icon: '🌱', tone: 'gold',
    title: 'Beginners welcome (actually)',
    desc: 'You don\'t need 10 years to teach someone with zero. The best mentor is often someone two steps ahead, not twenty.'
  }
];

const SKILL_CHIPS = [
  'React', 'Spring Boot', 'System Design', 'Product Strategy', 'Machine Learning',
  'Kubernetes', 'iOS / Swift', 'PostgreSQL', 'Rust', 'DSA / Interviews',
  'Figma', 'Go', 'Terraform', 'Public Speaking', 'Technical Writing'
];

const QUOTES = [
  {
    quote: "I traded my React knowledge for someone's PostgreSQL chops. Three sessions in, I shipped my first proper migration.",
    author: 'Priya N.', role: 'Frontend → Backend',
    initials: 'PN', tone: 'linear-gradient(135deg, #007A64, #00B896)'
  },
  {
    quote: "Honestly the first place online where teaching felt like a conversation, not a performance.",
    author: 'Marco D.', role: 'Engineering manager',
    initials: 'MD', tone: 'linear-gradient(135deg, #005A49, #007A64)'
  },
  {
    quote: "Got matched with someone two years ahead of me on system design. Way more useful than another course.",
    author: 'Aisha K.', role: 'New grad SWE',
    initials: 'AK', tone: 'linear-gradient(135deg, #22C55E, #16A34A)'
  }
];
