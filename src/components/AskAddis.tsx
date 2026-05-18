'use client';

// src/components/AskAddis.tsx
// Drop this anywhere in your layout — recommended: inside RootLayout in layout.tsx
// Just add <AskAddis /> after <Footer /> and before </body>

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  recommendations?: { name: string; slug: string }[];
}

const SUGGESTIONS = [
  'Best coffee in Bole?',
  'Romantic dinner spot tonight',
  'Affordable hotel near airport',
  'Rooftop bar with live music',
  'Traditional injera restaurant',
];

// Renders Claude's markdown-ish response into React elements with clickable links
function FormattedReply({
  text,
  recommendations,
}: {
  text: string;
  recommendations?: { name: string; slug: string }[];
}) {
  // Build a slug→name lookup
  const slugMap: Record<string, string> = {};
  recommendations?.forEach(r => { slugMap[r.slug] = r.name; });

  // Split by lines and render
  const lines = text.split('\n');

  return (
    <div style={{ fontSize: '.88rem', lineHeight: 1.65, color: '#1c1c1c' }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: '6px' }} />;

        // Bold business name line: **Name** (slug: some-slug)
        const bizMatch = line.match(/^\*\*(.+?)\*\*\s*\(slug:\s*([^)]+)\)/);
        if (bizMatch) {
          const name = bizMatch[1].trim();
          const slug = bizMatch[2].trim();
          return (
            <div key={i} style={{ marginTop: '14px', marginBottom: '2px' }}>
              <Link
                href={`/business/${slug}`}
                style={{
                  fontWeight: 700,
                  fontSize: '.92rem',
                  color: '#1a5c3a',
                  textDecoration: 'none',
                  borderBottom: '1.5px solid #1a5c3a',
                  paddingBottom: '1px',
                }}
              >
                {name} →
              </Link>
            </div>
          );
        }

        // Why it fits line
        if (line.startsWith('Why it fits:')) {
          return (
            <div key={i} style={{ color: '#444', fontSize: '.85rem', marginBottom: '2px' }}>
              {line}
            </div>
          );
        }

        // Location + rating line (📍 ... · ⭐ ...)
        if (line.startsWith('📍')) {
          return (
            <div key={i} style={{ fontSize: '.8rem', color: '#6b6b6b', marginBottom: '4px' }}>
              {line}
            </div>
          );
        }

        // Regular line — strip any remaining **bold** markers
        const cleaned = line.replace(/\*\*(.+?)\*\*/g, '$1');
        return (
          <div key={i} style={{ marginBottom: '1px' }}>
            {cleaned}
          </div>
        );
      })}
    </div>
  );
}

export default function AskAddis() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stop pulsing after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask-addis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: data.reply, recommendations: data.recommendations },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: "Sorry, I couldn't find results right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        @keyframes ar-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ar-pulse-ring {
          0% { transform: scale(1); opacity: .6; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes ar-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ar-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ar-thinking {
          0%, 80%, 100% { transform: scale(0); opacity: .3; }
          40% { transform: scale(1); opacity: 1; }
        }
        .ar-dot-1 { animation: ar-thinking 1.2s infinite ease-in-out; }
        .ar-dot-2 { animation: ar-thinking 1.2s infinite ease-in-out .2s; }
        .ar-dot-3 { animation: ar-thinking 1.2s infinite ease-in-out .4s; }
        .ar-msg { animation: ar-fade-in .3s ease; }
        .ar-suggestion:hover { background: #e8f5ee !important; color: #1a5c3a !important; border-color: #1a5c3a !important; }
        .ar-send:hover { background: #2d8657 !important; }
        .ar-close:hover { background: rgba(255,255,255,.15) !important; }
        @media (max-width: 500px) {
          .ar-panel { right: 0 !important; left: 0 !important; bottom: 80px !important; border-radius: 20px 20px 0 0 !important; width: 100% !important; }
        }
      `}</style>

      {/* FLOATING BUTTON */}
      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
        }}
      >
        {/* Tooltip label — show before first open */}
        {!open && messages.length === 0 && (
          <div
            style={{
              background: '#1c1c1c',
              color: '#fff',
              fontSize: '.8rem',
              fontWeight: 600,
              padding: '7px 14px',
              borderRadius: '50px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 20px rgba(0,0,0,.25)',
              animation: 'ar-fade-in .4s ease',
              fontFamily: 'DM Sans, system-ui, sans-serif',
            }}
          >
            ✨ Ask Addis — AI local guide
          </div>
        )}

        {/* Pulse ring */}
        {pulse && !open && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#1a5c3a',
              animation: 'ar-pulse-ring 1.6s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Main button */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Ask Addis AI"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: open
              ? '#1c1c1c'
              : 'linear-gradient(135deg, #1a5c3a, #2d8657)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 6px 28px rgba(26,92,58,.5)',
            transition: 'all .25s',
            animation: !open && pulse ? 'ar-bounce 2s ease-in-out infinite' : 'none',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {open ? '✕' : '🇪🇹'}
        </button>
      </div>

      {/* CHAT PANEL */}
      {open && (
        <div
          className="ar-panel"
          style={{
            position: 'fixed',
            bottom: '104px',
            right: '28px',
            width: '380px',
            maxHeight: '560px',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,.22), 0 4px 16px rgba(0,0,0,.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999,
            animation: 'ar-slide-up .25s ease',
            fontFamily: 'DM Sans, system-ui, sans-serif',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0e3d26, #1a5c3a)',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(245,197,24,.2)',
                border: '2px solid rgba(245,197,24,.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0,
              }}
            >
              🇪🇹
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '.95rem',
                  color: '#fff',
                  fontFamily: 'Playfair Display, Georgia, serif',
                }}
              >
                Ask Addis
              </div>
              <div
                style={{
                  fontSize: '.73rem',
                  color: 'rgba(255,255,255,.6)',
                  marginTop: '1px',
                }}
              >
                Your AI local guide to Ethiopia
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '.72rem',
                color: 'rgba(255,255,255,.55)',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  boxShadow: '0 0 6px #4ade80',
                }}
              />
              Online
            </div>
          </div>

          {/* MESSAGES */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#fafaf8',
            }}
          >
            {/* Welcome state */}
            {isEmpty && (
              <div className="ar-msg" style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>👋</div>
                <div
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                    color: '#1c1c1c',
                  }}
                >
                  Selam! I'm Ask Addis
                </div>
                <div
                  style={{
                    fontSize: '.83rem',
                    color: '#6b6b6b',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                  }}
                >
                  Tell me what you're looking for and I'll find the best spots from 7,600+ businesses in Ethiopia.
                </div>
                {/* Suggestion pills */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '7px',
                    justifyContent: 'center',
                  }}
                >
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      className="ar-suggestion"
                      onClick={() => sendMessage(s)}
                      style={{
                        background: '#fff',
                        border: '1.5px solid #e8ddd0',
                        borderRadius: '50px',
                        padding: '6px 14px',
                        fontSize: '.78rem',
                        cursor: 'pointer',
                        color: '#1c1c1c',
                        fontFamily: 'DM Sans, system-ui, sans-serif',
                        fontWeight: 500,
                        transition: 'all .15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message history */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className="ar-msg"
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg,#1a5c3a,#2d8657)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '.85rem',
                      flexShrink: 0,
                      marginRight: '8px',
                      marginTop: '2px',
                    }}
                  >
                    🇪🇹
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '85%',
                    padding: msg.role === 'user' ? '10px 14px' : '12px 14px',
                    borderRadius:
                      msg.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg,#1a5c3a,#2d8657)'
                        : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#1c1c1c',
                    fontSize: '.88rem',
                    lineHeight: 1.55,
                    boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                    border: msg.role === 'assistant' ? '1px solid #e8ddd0' : 'none',
                  }}
                >
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    <FormattedReply
                      text={msg.text}
                      recommendations={msg.recommendations}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div className="ar-msg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#1a5c3a,#2d8657)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.85rem',
                    flexShrink: 0,
                  }}
                >
                  🇪🇹
                </div>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e8ddd0',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '5px',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                  }}
                >
                  {[1, 2, 3].map(n => (
                    <div
                      key={n}
                      className={`ar-dot-${n}`}
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#1a5c3a',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div
            style={{
              padding: '12px 14px',
              borderTop: '1px solid #e8ddd0',
              background: '#fff',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask me anything about Ethiopia…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              disabled={loading}
              style={{
                flex: 1,
                border: '1.5px solid #e8ddd0',
                borderRadius: '50px',
                padding: '10px 16px',
                fontSize: '.87rem',
                outline: 'none',
                fontFamily: 'DM Sans, system-ui, sans-serif',
                color: '#1c1c1c',
                background: '#fafaf8',
                transition: 'border-color .15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#1a5c3a')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e8ddd0')}
            />
            <button
              className="ar-send"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#1a5c3a',
                border: 'none',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0,
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition: 'all .15s',
              }}
            >
              ↑
            </button>
          </div>

          {/* FOOTER */}
          <div
            style={{
              padding: '6px 14px 8px',
              textAlign: 'center',
              fontSize: '.68rem',
              color: '#aaa',
              background: '#fff',
              fontFamily: 'DM Sans, system-ui, sans-serif',
            }}
          >
            Powered by AddisReview × Claude AI · Results from real businesses
          </div>
        </div>
      )}
    </>
  );
}
