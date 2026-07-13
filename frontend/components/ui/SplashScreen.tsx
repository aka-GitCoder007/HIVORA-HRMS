'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [phase, setPhase] = useState<'visible' | 'fadeout' | 'done'>('visible')

  useEffect(() => {
    // Start fade-out after 2.6s, then unmount at 3.2s
    const fadeTimer = setTimeout(() => setPhase('fadeout'), 2600)
    const doneTimer = setTimeout(() => setPhase('done'), 3200)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  if (phase === 'done') return null

  return (
    <>
      <style>{`
        @keyframes splash-bg-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes splash-logo-in {
          0%   { opacity: 0; transform: scale(0.6) translateY(12px); filter: blur(12px); }
          60%  { opacity: 1; transform: scale(1.06) translateY(-3px); filter: blur(0px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
        }
        @keyframes splash-ring-expand {
          0%   { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes splash-wordmark-in {
          0%   { opacity: 0; transform: translateY(18px) letterSpacing 0; }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-tagline-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes splash-bar-fill {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes splash-shimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes splash-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }

        .splash-logo-animate {
          animation: splash-logo-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
        }
        .splash-ring {
          animation: splash-ring-expand 1.4s ease-out 0.25s both;
        }
        .splash-ring-2 {
          animation: splash-ring-expand 1.4s ease-out 0.5s both;
        }
        .splash-wordmark-animate {
          animation: splash-wordmark-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.95s both;
        }
        .splash-tagline-animate {
          animation: splash-tagline-in 0.6s ease-out 1.5s both;
        }
        .splash-bar-animate {
          animation: splash-bar-fill 2.2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both;
        }
        .splash-shimmer-animate {
          animation: splash-shimmer 1.6s ease-in-out 1.1s infinite;
        }
        .splash-dot-1 { animation: splash-dot 1.2s ease-in-out 1.5s infinite; }
        .splash-dot-2 { animation: splash-dot 1.2s ease-in-out 1.65s infinite; }
        .splash-dot-3 { animation: splash-dot 1.2s ease-in-out 1.8s infinite; }

        .splash-fadeout {
          animation: splash-tagline-in 0.6s ease-in reverse both;
        }
      `}</style>

      {/* Full-screen overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 70%, #0f172a 100%)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          opacity: phase === 'fadeout' ? 0 : 1,
          transform: phase === 'fadeout' ? 'scale(1.03)' : 'scale(1)',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow blobs */}
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', top: '10%', left: '15%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '50%', bottom: '5%', right: '10%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Center content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* Logo container with ripple rings */}
          <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 28 }}>
            {/* Ripple ring 1 */}
            <div className="splash-ring" style={{
              position: 'absolute', inset: '-10px',
              borderRadius: '50%',
              border: '1.5px solid rgba(56,189,248,0.45)',
            }} />
            {/* Ripple ring 2 */}
            <div className="splash-ring-2" style={{
              position: 'absolute', inset: '-10px',
              borderRadius: '50%',
              border: '1.5px solid rgba(168,85,247,0.35)',
            }} />

            {/* Glow behind logo */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '28px',
              background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(168,85,247,0.15) 60%, transparent 80%)',
              filter: 'blur(8px)',
            }} />

            {/* Logo image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/apple-touch-icon.png"
              alt="HIVORA"
              className="splash-logo-animate"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                objectFit: 'cover',
                boxShadow: '0 0 40px rgba(56,189,248,0.3), 0 0 80px rgba(168,85,247,0.15)',
              }}
            />
          </div>

          {/* HIVORA wordmark */}
          <div className="splash-wordmark-animate" style={{ marginBottom: 10 }}>
            <span style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '2.6rem',
              fontWeight: 800,
              letterSpacing: '0.25em',
              lineHeight: 1,
              userSelect: 'none',
            }}>
              <span style={{ color: '#fff' }}>H</span>
              <span style={{
                background: 'linear-gradient(90deg, #38BDF8 0%, #818CF8 50%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>IV</span>
              <span style={{ color: '#fff' }}>ORA</span>
            </span>
          </div>

          {/* Tagline */}
          <div className="splash-tagline-animate" style={{
            color: 'rgba(148,163,184,0.85)',
            fontSize: '0.78rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 500,
            marginBottom: 40,
          }}>
            HRMS · Empowering Every Workforce
          </div>

          {/* Progress bar */}
          <div style={{
            width: 180,
            height: 2,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div className="splash-bar-animate" style={{
              height: '100%',
              borderRadius: 99,
              background: 'linear-gradient(90deg, #38BDF8, #818CF8, #A855F7)',
              position: 'absolute',
              top: 0, left: 0,
            }}>
              {/* shimmer on bar */}
              <div className="splash-shimmer-animate" style={{
                position: 'absolute', top: 0, bottom: 0, width: '40%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Loading dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`splash-dot-${i + 1}`}
                style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: i === 0 ? '#38BDF8' : i === 1 ? '#818CF8' : '#A855F7',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
