import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'AddisReview\'s privacy policy — how we collect, use, and protect your personal information.',
  alternates: { canonical: 'https://www.addisreviews.com/privacy' },
};

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create an account, we collect your name, email address, and profile photo (if signing in with Google). This information is used to identify you, display your reviews, and communicate with you about your account.',
      },
      {
        subtitle: 'Reviews & Content',
        text: 'Any reviews, ratings, photos, or other content you submit on AddisReview is stored and associated with your account. This content is visible to other users on the platform.',
      },
      {
        subtitle: 'Business Owner Information',
        text: 'If you claim a business listing, we collect additional verification information including your name, role, phone number, and email to confirm your association with the business.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you interact with AddisReview, including pages visited, search queries, and the device and browser you use. This helps us improve the platform.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: 'To Provide the Service',
        text: 'We use your information to create and manage your account, display your reviews, verify business ownership, and provide customer support.',
      },
      {
        subtitle: 'To Improve AddisReview',
        text: 'Usage data and feedback help us understand how people use the platform so we can fix bugs, improve search, and add features that matter to our community.',
      },
      {
        subtitle: 'To Communicate With You',
        text: 'We may send you transactional emails such as account confirmation, review notifications, and business claim approvals. We do not send unsolicited marketing emails.',
      },
      {
        subtitle: 'For Safety and Security',
        text: 'We use your information to detect and prevent fraudulent activity, spam, and violations of our terms of service.',
      },
    ],
  },
  {
    title: '3. Information Sharing',
    content: [
      {
        subtitle: 'Public Content',
        text: 'Reviews, ratings, and profile information you choose to share on AddisReview are visible to all users of the platform, including visitors who are not logged in.',
      },
      {
        subtitle: 'Service Providers',
        text: 'We share data with trusted third-party service providers who help us operate AddisReview, including Supabase (database), Vercel (hosting), Google (authentication and maps), Twilio (phone verification), and Resend (email). These providers are contractually bound to protect your data.',
      },
      {
        subtitle: 'No Sale of Data',
        text: 'We do not sell, rent, or trade your personal information to third parties for their marketing purposes.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information if required by law, court order, or governmental authority, or to protect the rights and safety of AddisReview, our users, or the public.',
      },
    ],
  },
  {
    title: '4. Data Storage & Security',
    content: [
      {
        subtitle: 'Where Your Data is Stored',
        text: 'Your data is stored securely on Supabase servers. We use row-level security policies to ensure that users can only access their own data where applicable.',
      },
      {
        subtitle: 'Security Measures',
        text: 'We implement industry-standard security practices including encrypted connections (HTTPS), hashed passwords, and access controls. However, no system is completely secure, and we cannot guarantee absolute security.',
      },
      {
        subtitle: 'Data Retention',
        text: 'We retain your account information and content as long as your account is active. If you request account deletion, we will remove your personal information within 30 days, though some anonymized data may be retained for platform analytics.',
      },
    ],
  },
  {
    title: '5. Your Rights',
    content: [
      {
        subtitle: 'Access and Correction',
        text: 'You can view and update your profile information at any time from your account settings. If you cannot access or correct information, contact us and we will help.',
      },
      {
        subtitle: 'Deletion',
        text: 'You may request deletion of your account and associated personal data by emailing us at hello@addisreview.co. Note that public reviews you have posted may be anonymized rather than deleted to maintain the integrity of business ratings.',
      },
      {
        subtitle: 'Opt-out',
        text: 'You may opt out of non-essential communications by contacting us. You cannot opt out of transactional emails related to your account activity.',
      },
    ],
  },
  {
    title: '6. Cookies',
    content: [
      {
        subtitle: 'How We Use Cookies',
        text: 'AddisReview uses cookies and similar technologies to keep you logged in, remember your preferences, and understand how the platform is used. We use session cookies (which expire when you close your browser) and persistent cookies (which remain for a set period).',
      },
      {
        subtitle: 'Third-Party Cookies',
        text: 'Google Maps and Google Authentication may set their own cookies when you use those features. These are governed by Google\'s privacy policy.',
      },
    ],
  },
  {
    title: '7. Children\'s Privacy',
    content: [
      {
        subtitle: '',
        text: 'AddisReview is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.',
      },
    ],
  },
  {
    title: '8. Changes to This Policy',
    content: [
      {
        subtitle: '',
        text: 'We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page. For significant changes, we may notify you via email or a notice on the platform. Continued use of AddisReview after changes means you accept the updated policy.',
      },
    ],
  },
  {
    title: '9. Contact Us',
    content: [
      {
        subtitle: '',
        text: 'If you have questions about this Privacy Policy or how we handle your data, please contact us at hello@addisreview.co. We aim to respond to all privacy inquiries within 7 business days.',
      },
    ],
  },
];

export default function PrivacyPage() {
  const lastUpdated = 'May 2025';

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--green) 0%, #0f3d26 100%)',
          padding: '80px 5vw 60px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '16px' }}>🔒</div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '16px',
            }}>Privacy Policy</h1>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,.7)',
              lineHeight: 1.7,
            }}>
              Your privacy matters to us. This policy explains how AddisReview collects,
              uses, and protects your personal information.
            </p>
            <p style={{
              fontSize: '.82rem',
              color: 'rgba(255,255,255,.45)',
              marginTop: '16px',
            }}>
              Last Updated: {lastUpdated}
            </p>
          </div>
        </section>

        {/* Content */}
        <section style={{ padding: '60px 5vw 80px', background: 'var(--warm-white)' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>

            {/* Intro */}
            <div style={{
              background: 'var(--green-pale)',
              borderRadius: 'var(--radius)',
              padding: '24px 28px',
              marginBottom: '48px',
              borderLeft: '4px solid var(--green)',
            }}>
              <p style={{ fontSize: '.95rem', color: 'var(--charcoal)', lineHeight: 1.7 }}>
                <strong>Summary:</strong> AddisReview collects basic account information to provide
                the service. We don't sell your data. Your reviews are public. You can request
                deletion of your account at any time. We use trusted third-party services to
                operate the platform.
              </p>
            </div>

            {/* Policy Sections */}
            {sections.map((section, i) => (
              <div key={i} style={{ marginBottom: '48px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: 'var(--charcoal)',
                  marginBottom: '20px',
                  paddingBottom: '12px',
                  borderBottom: '1.5px solid var(--border)',
                }}>
                  {section.title}
                </h2>
                {section.content.map((item, j) => (
                  <div key={j} style={{ marginBottom: item.subtitle ? '20px' : '0' }}>
                    {item.subtitle && (
                      <h3 style={{
                        fontSize: '.93rem',
                        fontWeight: 700,
                        color: 'var(--charcoal)',
                        marginBottom: '6px',
                      }}>
                        {item.subtitle}
                      </h3>
                    )}
                    <p style={{
                      fontSize: '.93rem',
                      color: 'var(--muted)',
                      lineHeight: 1.75,
                    }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            ))}

            {/* Contact box */}
            <div style={{
              background: '#fff',
              borderRadius: 'var(--radius)',
              padding: '32px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
              marginTop: '16px',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>✉️</div>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--charcoal)',
                marginBottom: '10px',
              }}>Questions about your privacy?</h3>
              <p style={{
                fontSize: '.9rem', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6,
              }}>
                We're happy to help. Reach out and we'll get back to you within 7 business days.
              </p>
              <a
                href="mailto:hello@addisreview.co"
                className="btn-primary"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                hello@addisreview.co
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
