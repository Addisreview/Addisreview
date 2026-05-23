import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#111', color: 'rgba(255,255,255,.45)', padding: '48px 5vw 28px' }}>
      <div className="footer-grid" style={{ display: 'flex', justifyContent: 'space-between', gap: '36px', flexWrap: 'wrap', marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        
        <div className="footer-brand">
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--yellow)' }}>
            AddisReview<span style={{ color: 'rgba(255,255,255,.5)', fontStyle: 'italic' }}>.</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,.38)', fontSize: '.83rem', marginTop: '8px', maxWidth: '240px', lineHeight: 1.5 }}>
            Ethiopia's trusted guide to local businesses — restaurants, hotels, shops & more.
          </div>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '.87rem', marginBottom: '12px' }}>Explore</h4>
          {[
            { label: 'Restaurants', href: '/search?category=Restaurants' },
            { label: 'Hotels', href: '/search?category=Hotels' },
            { label: 'Coffee & Buna', href: '/search?category=Coffee+%26+Buna' },
            { label: 'Spas', href: '/search?category=Spas' },
            { label: 'Rooftop Bars', href: '/search?category=Rooftop+Bars+%26+Lounges' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="footer-link">{item.label}</Link>
          ))}
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '.87rem', marginBottom: '12px' }}>Cities</h4>
          {[
            { label: 'Addis Ababa', href: '/search?city=Addis+Ababa' },
            { label: 'Gondar', href: '/search?city=Gondar' },
            { label: 'Hawassa', href: '/search?city=Hawassa' },
            { label: 'Bahir Dar', href: '/search?city=Bahir+Dar' },
            { label: 'Dire Dawa', href: '/search?city=Dire+Dawa' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="footer-link">{item.label}</Link>
          ))}
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '.87rem', marginBottom: '12px' }}>For Businesses</h4>
          {[
            { label: 'Claim Your Business', href: '/search' },
            { label: 'Owner Dashboard', href: '/dashboard' },
            { label: 'Add Your Business', href: '/auth' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="footer-link">{item.label}</Link>
          ))}
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '.87rem', marginBottom: '12px' }}>Company</h4>
          {[
            { label: 'About Us', href: '/about' },
            { label: 'Contact Us', href: '/contact' },
            { label: 'Advertise with Us', href: '/advertise' },
            { label: 'Privacy Policy', href: '/privacy' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="footer-link">{item.label}</Link>
          ))}
        </div>
      </div>

      <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', flexWrap: 'wrap', gap: '10px' }}>
        <span>© {new Date().getFullYear()} AddisReview. All rights reserved.</span>
        <span>🇪🇹 Built with pride in Ethiopia</span>
      </div>
    </footer>
  );
}
