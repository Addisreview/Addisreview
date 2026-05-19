'use client';

// src/app/claim/[businessId]/ClaimBusinessClient.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';

interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  category_name: string | null;
}

interface Props {
  business: Business;
  user: User | null;
}

const ROLES = ['Owner', 'Co-owner', 'Manager', 'Authorized Representative'];
const STEPS = ['Your Details', 'Verify Phone', 'Done'];

export default function ClaimBusinessClient({ business, user }: Props) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(business.phone || '');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async () => {
    if (!phone.trim()) { toast.error('Please enter a phone number'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/claim/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), channel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpSent(true);
      toast.success(`Code sent via ${channel === 'sms' ? 'SMS' : 'WhatsApp'}!`);
      setStep(1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const verifyAndSubmit = async () => {
    if (!otp.trim() || otp.length < 4) { toast.error('Please enter the verification code'); return; }
    setVerifying(true);
    try {
      const res = await fetch('/api/claim/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          code: otp.trim(),
          businessId: business.id,
          userId: user?.id || null,
          fullName,
          role,
          email,
          verificationMethod: channel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleStep0Submit = () => {
    if (!fullName.trim()) { toast.error('Please enter your full name'); return; }
    if (!role) { toast.error('Please select your role'); return; }
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    sendOtp();
  };

  return (
    <main style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 5vw 80px', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '.8rem', color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Business Claim
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1.2 }}>
          Claim {business.name}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '.92rem', lineHeight: 1.6 }}>
          Verify you own or manage this business to unlock your free listing.
        </p>
      </div>

      {/* BUSINESS CARD */}
      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '32px', display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{ fontSize: '2rem' }}>🏢</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-serif)' }}>{business.name}</div>
          <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '2px' }}>
            {business.category_name}{business.address ? ` · ${business.address}` : ''}
          </div>
        </div>
      </div>

      {/* STEPS */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '36px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: i <= step ? 'var(--green)' : '#e8ddd0',
                color: i <= step ? '#fff' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '.82rem', marginBottom: '6px',
                transition: 'all .2s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: '.72rem', color: i === step ? 'var(--green)' : 'var(--muted)', fontWeight: i === step ? 700 : 400, textAlign: 'center' }}>
                {s}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: '2px', flex: 1, background: i < step ? 'var(--green)' : '#e8ddd0', marginBottom: '22px', transition: 'background .2s' }} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 0 — YOUR DETAILS */}
      {step === 0 && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '7px', display: 'block' }}>
              Full Name <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Abebe Girma"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '7px', display: 'block' }}>
              Your Role <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="">Select your role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '7px', display: 'block' }}>
              Your Email <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '7px', display: 'block' }}>
              Business Phone Number <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="+251911234567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginTop: '5px' }}>
              Must be the phone number listed for this business. Include country code (e.g. +251 for Ethiopia).
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '10px', display: 'block' }}>
              Send verification code via
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['sms', 'whatsapp'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    border: channel === c ? '2px solid var(--green)' : '2px solid var(--border)',
                    background: channel === c ? 'var(--green-pale)' : '#fff',
                    cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif',
                    fontWeight: 600, fontSize: '.88rem',
                    color: channel === c ? 'var(--green)' : 'var(--charcoal)',
                    transition: 'all .15s',
                  }}
                >
                  {c === 'sms' ? '📱 SMS' : '💬 WhatsApp'}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleStep0Submit}
            disabled={sending}
            style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '.95rem' }}
          >
            {sending ? 'Sending code…' : `Send Verification Code →`}
          </button>

          <div style={{ marginTop: '16px', padding: '14px 16px', background: '#fff9e6', border: '1px solid var(--yellow)', borderRadius: '10px', fontSize: '.82rem', color: '#6b5500' }}>
            💡 A 6-digit code will be sent to the business phone number to confirm you have access to it.
          </div>
        </div>
      )}

      {/* STEP 1 — VERIFY OTP */}
      {step === 1 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{channel === 'sms' ? '📱' : '💬'}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Check your {channel === 'sms' ? 'messages' : 'WhatsApp'}
            </div>
            <div style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              We sent a 6-digit code to <strong>{phone}</strong>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '7px', display: 'block' }}>
              Enter 6-digit code
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="123456"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              style={{ fontSize: '1.4rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 700 }}
            />
          </div>

          <button
            className="btn-primary"
            onClick={verifyAndSubmit}
            disabled={verifying}
            style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '.95rem', marginBottom: '12px' }}
          >
            {verifying ? 'Verifying…' : 'Verify & Submit Claim →'}
          </button>

          <button
            onClick={() => { setStep(0); setOtp(''); setOtpSent(false); }}
            style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.88rem', cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif' }}
          >
            ← Go back / change number
          </button>

          <button
            onClick={sendOtp}
            disabled={sending}
            style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: 'var(--green)', fontSize: '.85rem', cursor: 'pointer', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 600 }}
          >
            {sending ? 'Sending…' : 'Resend code'}
          </button>
        </div>
      )}

      {/* STEP 2 — SUCCESS */}
      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '12px' }}>
            Claim Submitted!
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '.92rem', lineHeight: 1.7, marginBottom: '28px', maxWidth: '380px', margin: '0 auto 28px' }}>
            Your claim for <strong>{business.name}</strong> is under review. We'll email you at <strong>{email}</strong> within 1-2 business days once it's approved.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push(`/business/${business.slug}`)}
            style={{ padding: '14px 32px', fontSize: '.95rem' }}
          >
            Back to Business Page →
          </button>
        </div>
      )}
    </main>
  );
}
