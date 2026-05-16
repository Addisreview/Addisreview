import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#111', color: 'rgba(255,255,255,.45)', padding: '48px 5vw 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '36px', flexWrap: 'wrap', marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--yellow)' }}>
            AddisReview<span style={{ color: 'rgba(255,255,255,.5)', fontStyle: 'italic' }}>.</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,.38)', fontSize: '.83rem', marginTop: '8px', maxWidth: '240px', lineHeight: 1.5 }}>
            Ethiopia's trusted guide to local businesses — restaurants, hotels, shops & more.
          </div>
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '.87rem', marginBottom: '12px' }}>Explore</h4>
          {['Restaurants','Hotels','Coffee Houses','Shopping'].map(item => (
            <Link key={item} href={`/search?category=${item.toLowerCase()}`}
              style={{ display: 'block', color: 'rgba(255,255,255,.42)', textDecoration: 'none', fontSize: '.83rem', marginBottom: '8px' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--yellow)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.42)')}
            >{item}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '.87rem', marginBottom: '12px' }}>Cities</h4>
          {['Addis Ababa','Gondar','Hawassa','Bahir Dar'].map(city => (
            <Link key={city} href={`/search?city=${city}`}
              style={{ display: 'block', color: 'rgba(255,255,255,.42)', textDecoration: 'none', fontSize: '.83rem', marginBottom: '8px' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--yellow)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.42)')}
            >{city}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '.87rem', marginBottom: '12px' }}>Company</h4>
          {['About Us','Careers','Press','Contact'].map(item => (
            <span key={item} style={{ display: 'block', color: 'rgba(255,255,255,.42)', fontSize: '.83rem', marginBottom: '8px', cursor: 'pointer' }}>{item}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', flexWrap: 'wrap', gap: '10px' }}>
        <span>© {new Date().getFullYear()} AddisReview. All rights reserved.</span>
        <span>🇪🇹 Built with pride in Ethiopia</span>
      </div>
    </footer>
  );
}
