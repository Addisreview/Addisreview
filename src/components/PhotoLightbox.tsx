'use client';

// src/components/PhotoLightbox.tsx
// Usage: import PhotoLightbox from '@/components/PhotoLightbox';
// Add <PhotoLightbox photos={allPhotos} initialIndex={clickedIndex} onClose={() => setLightbox(null)} />

import { useEffect, useCallback } from 'react';

interface Props {
  photos: string[];
  initialIndex: number;
  onClose: () => void;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function PhotoLightbox({ photos, initialIndex, onClose, currentIndex, onNext, onPrev }: Props) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <>
      <style>{`
        @keyframes lb-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lb-img-in {
          from { opacity: 0; transform: scale(.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .lb-overlay {
          animation: lb-fade-in .2s ease;
        }
        .lb-img {
          animation: lb-img-in .25s ease;
        }
        .lb-arrow:hover {
          background: rgba(255,255,255,.2) !important;
          transform: scale(1.08);
        }
        .lb-close:hover {
          background: rgba(255,255,255,.2) !important;
          transform: scale(1.08);
        }
        .lb-thumb:hover {
          opacity: 1 !important;
          border-color: #fff !important;
        }
      `}</style>

      {/* OVERLAY */}
      <div
        className="lb-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(0,0,0,.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* CLOSE */}
        <button
          className="lb-close"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,.1)',
            border: '1px solid rgba(255,255,255,.2)',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all .15s',
            zIndex: 2001,
          }}
        >
          ✕
        </button>

        {/* COUNTER */}
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,.6)',
          fontSize: '.82rem',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontWeight: 600,
          letterSpacing: '.5px',
          zIndex: 2001,
        }}>
          {currentIndex + 1} / {photos.length}
        </div>

        {/* MAIN IMAGE */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '80px 80px 120px',
            boxSizing: 'border-box',
          }}
        >
          <img
            key={currentIndex}
            className="lb-img"
            src={photos[currentIndex]}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 20px 80px rgba(0,0,0,.8)',
            }}
          />
        </div>

        {/* PREV ARROW */}
        {photos.length > 1 && (
          <button
            className="lb-arrow"
            onClick={e => { e.stopPropagation(); onPrev(); }}
            style={{
              position: 'fixed',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .15s',
              zIndex: 2001,
            }}
          >
            ←
          </button>
        )}

        {/* NEXT ARROW */}
        {photos.length > 1 && (
          <button
            className="lb-arrow"
            onClick={e => { e.stopPropagation(); onNext(); }}
            style={{
              position: 'fixed',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .15s',
              zIndex: 2001,
            }}
          >
            →
          </button>
        )}

        {/* THUMBNAIL STRIP */}
        {photos.length > 1 && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 2001,
              maxWidth: '90vw',
              overflowX: 'auto',
              padding: '8px',
            }}
          >
            {photos.map((url, i) => (
              <img
                key={i}
                className="lb-thumb"
                src={url}
                alt=""
                onClick={() => {
                  // navigate to this index
                  const diff = i - currentIndex;
                  if (diff > 0) for (let j = 0; j < diff; j++) onNext();
                  else if (diff < 0) for (let j = 0; j < Math.abs(diff); j++) onPrev();
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: i === currentIndex ? 1 : 0.45,
                  border: i === currentIndex ? '2px solid #fff' : '2px solid transparent',
                  transition: 'all .15s',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
