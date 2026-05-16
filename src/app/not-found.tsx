import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '120px 5vw' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🇪🇹</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px' }}>Page not found</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginBottom: '32px' }}>We couldn't find what you were looking for.</p>
        <Link href="/">
          <button className="btn-primary">Back to Home →</button>
        </Link>
      </div>
    </>
  );
}
