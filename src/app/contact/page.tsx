import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: "Get in touch with the AddisReview team. We're here to help.",
  alternates: { canonical: 'https://www.addisreviews.com/contact' },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <style>{`
        .contact-card {
          background: #fff;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          padding: 32px 28px;
          box-shadow: var(--shadow-sm);
          text-decoration: none;
          display: block;
          transition: box-shadow .2s, transform .2s;
        }
        .contact-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
      `}</style>
      <main>
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--green) 0%, #0f3d26 100%)',
          padding: '80px 5vw 60px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '16px' }}>👋</div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '16px',
            }}>
              We're Here to Help
            </h1>
            <p style={{
              fontSize: '1.05rem',
              color: 'rgba(255,255,255,.75)',
              lineHeight: 1.7,
            }}>
              Whether you have a question about a listing, want to claim your business,
              or just want to say hello — we'd love to hear from you.
              Reach out using any of the methods below and we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact cards */}
        <section style={{ padding: '64px 5vw 80px', background: 'var(--warm-white)' }}>
          <div style={{
            maxWidth: '860px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>

            <a href="mailto:hello@addisreviews.com" className="contact-card">
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📧</div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '8px' }}>Email</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '10px' }}>hello@addisreviews.com</div>
              <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>Best for general inquiries, business claims, and partnerships.</div>
            </a>

            <a href="tel:+15712755081" className="contact-card">
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📞</div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '8px' }}>Phone (US)</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '10px' }}>+1 (571) 275-5081</div>
              <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>Available Monday – Friday, 9am – 6pm EST.</div>
            </a>

            <a href="tel:+251988588584" className="contact-card">
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📱</div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '8px' }}>Phone (Ethiopia)</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '10px' }}>+251 988 588 584</div>
              <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>Available Monday – Friday, 9am – 6pm EAT.</div>
            </a>

            <a href="https://maps.google.com?q=10050+American+Pharaoh+Ln+Laurel+MD+20723" target="_blank" rel="noreferrer" className="contact-card">
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📍</div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '8px' }}>Office Address</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '10px' }}>
                10050 American Pharaoh Ln<br />Laurel, MD 20723
              </div>
              <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>United States headquarters. Click to open in Google Maps.</div>
            </a>

          </div>

          {/* Response time note */}
          <div style={{
            maxWidth: '860px', margin: '32px auto 0',
            background: 'var(--green-pale)', borderRadius: 'var(--radius)',
            padding: '20px 28px', display: 'flex', alignItems: 'center', gap: '14px',
            border: '1px solid rgba(26,92,58,.15)',
          }}>
            <span style={{ fontSize: '1.4rem' }}>⏱️</span>
            <p style={{ fontSize: '.9rem', color: 'var(--charcoal)', lineHeight: 1.6, margin: 0 }}>
              <strong>We typically respond within 24–48 hours.</strong> For urgent matters related
              to your business listing, calling is the fastest way to reach us.
            </p>
          </div>
        </section>

        {/* Business owners CTA */}
        <section style={{ padding: '64px 5vw', background: 'var(--green)', textAlign: 'center' }}>
          <div style={{ maxWidth: '540px', margin: '0 auto' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏢</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 900, color: '#fff', marginBottom: '14px',
            }}>
              Own a business in Ethiopia?
            </h2>
            <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,.75)', lineHeight: 1.7, marginBottom: '28px' }}>
              Claim your free listing, manage your profile, and connect with thousands of customers on AddisReview.
            </p>
            <a href="/search" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'var(--yellow)', color: 'var(--charcoal)', border: 'none',
                borderRadius: '50px', padding: '14px 32px',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              }}>
                Find & Claim Your Business →
              </button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
