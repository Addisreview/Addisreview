import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';
import { getBusinessCount } from '@/lib/stats';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about AddisReview — Ethiopia\'s trusted platform for discovering and reviewing local businesses.',
  alternates: { canonical: 'https://www.addisreviews.com/about' },
};

const team = [
  {
    emoji: '🇪🇹',
    title: 'Built by Ethiopians',
    text: 'AddisReview was born in Addis Ababa by people who love their city and wanted a better way to discover it.',
  },
  {
    emoji: '🤝',
    title: 'For the Community',
    text: 'We believe local businesses are the heartbeat of Ethiopia. Our mission is to connect them with the people who need them most.',
  },
  {
    emoji: '✨',
    title: 'Powered by Real Reviews',
    text: 'Every rating on AddisReview comes from a real person who visited, ate, stayed, or experienced it firsthand.',
  },
];

export default async function AboutPage() {
  const bizCount = await getBusinessCount();

  const stats = [
    { number: bizCount, label: 'Businesses Listed' },
    { number: '1', label: 'Country, Countless Stories' },
    { number: '∞', label: 'Cups of Buna Shared' },
    { number: '100%', label: 'Made for Ethiopia' },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--green) 0%, #0f3d26 100%)',
          padding: '100px 5vw 80px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'rgba(245,197,24,.08)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-40px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,.05)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🇪🇹</div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}>
              Ethiopia's Guide to<br />
              <span style={{ color: 'var(--yellow)' }}>Local Business</span>
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,.75)',
              lineHeight: 1.7,
              maxWidth: '540px',
              margin: '0 auto',
            }}>
              AddisReview is the trusted platform for discovering, reviewing, and celebrating
              the best businesses across Ethiopia — from cozy Buna shops in Piassa to rooftop
              restaurants overlooking Addis Ababa.
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <section style={{ background: 'var(--yellow)', padding: '36px 5vw' }}>
          <div style={{
            maxWidth: '900px', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: 'var(--charcoal)',
                }}>{s.number}</div>
                <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'rgba(28,28,28,.65)', marginTop: '4px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section style={{ padding: '80px 5vw', background: 'var(--warm-white)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{
              fontSize: '.8rem', fontWeight: 700, letterSpacing: '2px',
              color: 'var(--green)', textTransform: 'uppercase', marginBottom: '12px',
            }}>Our Mission</p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 900,
              color: 'var(--charcoal)',
              lineHeight: 1.2,
              marginBottom: '28px',
            }}>
              Helping Ethiopians discover great places — and helping great places get discovered.
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--muted)',
              lineHeight: 1.8,
              marginBottom: '20px',
            }}>
              Finding a reliable restaurant, a trusted mechanic, or a reputable hotel in Ethiopia
              shouldn't require asking five different people or scrolling through outdated Facebook
              posts. AddisReview brings all of that together in one place — with honest reviews,
              real photos, and accurate business information.
            </p>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--muted)',
              lineHeight: 1.8,
            }}>
              We're on a mission to build the most comprehensive, most trusted local business
              directory in Ethiopia — starting with Addis Ababa and growing to every city, town,
              and corner of the country.
            </p>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding: '20px 5vw 80px', background: 'var(--warm-white)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}>
              {team.map(card => (
                <div key={card.title} style={{
                  background: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '36px 32px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '16px' }}>{card.emoji}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--charcoal)',
                    marginBottom: '12px',
                  }}>{card.title}</h3>
                  <p style={{ fontSize: '.93rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section style={{ padding: '80px 5vw', background: 'var(--cream)' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <p style={{
              fontSize: '.8rem', fontWeight: 700, letterSpacing: '2px',
              color: 'var(--green)', textTransform: 'uppercase', marginBottom: '12px',
            }}>Our Story</p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 900,
              color: 'var(--charcoal)',
              lineHeight: 1.2,
              marginBottom: '28px',
            }}>Started with a simple question:</h2>
            <div style={{
              borderLeft: '4px solid var(--yellow)',
              paddingLeft: '24px',
              marginBottom: '32px',
            }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                fontStyle: 'italic',
                color: 'var(--charcoal)',
                lineHeight: 1.5,
              }}>
                "Why is it so hard to find a good restaurant in Addis Ababa without asking a friend?"
              </p>
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '20px' }}>
              We saw that Ethiopia — a country with a rich culture of hospitality, incredible food,
              and thriving local businesses — didn't have a modern, reliable platform to showcase them.
              So we built one.
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '20px' }}>
              Today, AddisReview has over {bizCount} businesses listed across Addis Ababa, with plans to
              expand to Gondar, Hawassa, Bahir Dar, Dire Dawa, and beyond. Every business listing
              comes with photos, reviews, hours, and AI-generated descriptions to help you make the
              right choice — fast.
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8 }}>
              We're just getting started. And we'd love for you to be part of it.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          padding: '80px 5vw',
          background: 'var(--green)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '16px',
            }}>Own a business in Ethiopia?</h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,.72)',
              lineHeight: 1.7,
              marginBottom: '32px',
            }}>
              Claim your listing for free, respond to reviews, add photos, and reach thousands
              of customers on AddisReview.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/search" className="btn-primary" style={{ textDecoration: 'none' }}>
                Find Your Business
              </a>
              <a href="mailto:hello@addisreviews.com" style={{
                textDecoration: 'none',
                color: 'rgba(255,255,255,.85)',
                fontWeight: 600,
                fontSize: '.95rem',
                padding: '13px 24px',
                border: '2px solid rgba(255,255,255,.3)',
                borderRadius: '50px',
                transition: 'all .2s',
              }}>
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
