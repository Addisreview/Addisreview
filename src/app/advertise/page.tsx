import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advertise with Us',
  description: 'Reach thousands of customers in Ethiopia by advertising on AddisReview.',
  alternates: { canonical: 'https://www.addisreviews.com/advertise' },
};

const perks = [
  { emoji: '👥', title: 'Massive Local Reach', desc: 'Connect with thousands of Ethiopians actively searching for businesses like yours every day.' },
  { emoji: '⭐', title: 'Featured Placement', desc: 'Get your business featured at the top of search results and on the AddisReview home page.' },
  { emoji: '📊', title: 'Business Analytics', desc: 'See how many people viewed your listing, clicked your phone number, and visited your website.' },
  { emoji: '✓', title: 'Verified Badge', desc: 'Stand out with a verified business badge that builds trust with potential customers.' },
  { emoji: '📸', title: 'Enhanced Profile', desc: 'Showcase your business with unlimited photos, a full description, and custom highlights.' },
  { emoji: '💬', title: 'Review Management', desc: 'Respond to customer reviews and show that you care about your customers experience.' },
];

export default function AdvertisePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--green) 0%, #0f3d26 100%)',
          padding: '80px 5vw 60px', textAlign: 'center',
        }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '16px' }}>📢</div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '20px',
            }}>
              Grow Your Business<br />
              <span style={{ color: 'var(--yellow)' }}>with AddisReview</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.75)', lineHeight: 1.7, marginBottom: '32px' }}>
              Ethiopia's fastest growing local business platform. We're building our advertising
              program and want you to be among the first to benefit. Get in touch today and
              we'll reach out as soon as it launches.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(245,197,24,.15)', border: '1px solid rgba(245,197,24,.4)',
              borderRadius: '50px', padding: '10px 22px',
              color: 'var(--yellow)', fontSize: '.88rem', fontWeight: 700,
            }}>
              🚀 Advertising program launching soon — register your interest today
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: 'var(--yellow)', padding: '36px 5vw' }}>
          <div style={{
            maxWidth: '900px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '24px', textAlign: 'center',
          }}>
            {[
              { number: '8,500+', label: 'Businesses Listed' },
              { number: '100%', label: 'Focus on Ethiopia' },
              { number: 'Free', label: 'Basic Listing' },
              { number: '∞', label: 'Growth Potential' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--charcoal)' }}>{s.number}</div>
                <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'rgba(28,28,28,.65)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section style={{ padding: '72px 5vw', background: 'var(--warm-white)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <p style={{ fontSize: '.8rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--green)', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>What You Get</p>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              fontWeight: 900, color: 'var(--charcoal)', textAlign: 'center', marginBottom: '48px', lineHeight: 1.2,
            }}>
              Everything you need to stand out in Ethiopia
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {perks.map(p => (
                <div key={p.title} style={{
                  background: '#fff', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', padding: '28px 24px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '14px' }}>{p.emoji}</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '10px' }}>{p.title}</h3>
                  <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Register interest */}
        <section style={{ padding: '72px 5vw', background: 'var(--cream)' }}>
          <div style={{
            maxWidth: '640px', margin: '0 auto', textAlign: 'center',
            background: '#fff', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', padding: '48px 40px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '16px' }}>📬</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3vw, 2rem)',
              fontWeight: 900, color: 'var(--charcoal)', marginBottom: '16px',
            }}>
              Be the first to advertise on AddisReview
            </h2>
            <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
              Our advertising program is coming soon. Reach out now and we'll contact you
              personally when it launches — with early adopter pricing.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              <a href="mailto:hello@addisreviews.com" style={{
                textDecoration: 'none', background: 'var(--green)', color: '#fff',
                borderRadius: '50px', padding: '14px 36px',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', display: 'inline-block',
              }}>
                hello@addisreviews.com
              </a>
              <a href="tel:+15712755081" style={{ textDecoration: 'none', color: 'var(--green)', fontWeight: 600, fontSize: '.93rem' }}>
                +1 (571) 275-5081
              </a>
              <a href="tel:+251988588584" style={{ textDecoration: 'none', color: 'var(--green)', fontWeight: 600, fontSize: '.93rem' }}>
                +251 988 588 584
              </a>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ padding: '64px 5vw', background: 'var(--green)', textAlign: 'center' }}>
          <div style={{ maxWidth: '540px', margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 900, color: '#fff', marginBottom: '14px',
            }}>
              Start with a free listing today
            </h2>
            <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,.75)', lineHeight: 1.7, marginBottom: '28px' }}>
              Claim your free business listing now while you wait for our advertising program.
              It takes 2 minutes and costs nothing.
            </p>
            <a href="/search" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'var(--yellow)', color: 'var(--charcoal)', border: 'none',
                borderRadius: '50px', padding: '14px 32px',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              }}>
                Claim Your Free Listing →
              </button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
