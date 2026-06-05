import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24
      }}
    >
      <div className="card glass-strong" style={{ maxWidth: 460, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🧭</div>
        <h1 style={{ fontSize: 28 }}>Lost in the catalogue</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          The page you&apos;re looking for doesn&apos;t exist (yet).
        </p>
        <div style={{ marginTop: 18 }}>
          <Link to="/" className="btn btn-primary">Take me home</Link>
        </div>
      </div>
    </div>
  );
}
