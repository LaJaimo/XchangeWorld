import React, { useState, useEffect, useRef, useCallback } from 'react'
import { db } from './firebase'
import { ref, onValue } from 'firebase/database'

// Word sizing and positioning
function buildWordCloud(words, containerW, containerH) {
  const counted = {}
  words.forEach(w => {
    const key = w.toLowerCase().trim()
    counted[key] = (counted[key] || 0) + 1
  })

  const entries = Object.entries(counted).sort((a, b) => b[1] - a[1])
  const maxCount = entries[0]?.[1] || 1

  return entries.map(([text, count], i) => {
    const ratio = count / maxCount
    const size = Math.round(28 + ratio * 72)
    return { text, count, size, id: text + i }
  })
}

// Animated word entry
function Word({ item, delay }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  const hue = Math.abs(item.text.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 360
  const colors = [
    '#00C2FF', '#FF3CAC', '#7B61FF', '#00F0A0',
    '#FFB800', '#FF6B6B', '#00CFFD', '#F050F8'
  ]
  const color = colors[Math.abs(item.text.charCodeAt(0)) % colors.length]

  return (
    <span
      style={{
        fontSize: `${item.size}px`,
        fontFamily: 'var(--font-display)',
        color,
        letterSpacing: '0.02em',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'inline-block',
        margin: '6px 10px',
        cursor: 'default',
        textShadow: `0 0 30px ${color}66`,
        lineHeight: 1.1,
      }}
    >
      {item.text}
    </span>
  )
}

export default function Screen() {
  const [responses, setResponses] = useState([])
  const [session, setSession] = useState(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const sessionRef = ref(db, 'activeSession')
    const unsub = onValue(sessionRef, snap => setSession(snap.val()))
    return () => unsub()
  }, [])

  useEffect(() => {
    const sessionId = session?.id || 'default'
    const respRef = ref(db, `responses/${sessionId}`)
    const unsub = onValue(respRef, snap => {
      const data = snap.val()
      if (!data) { setResponses([]); setCount(0); return }
      const arr = Object.values(data).map(r => r.text).filter(Boolean)
      setCount(arr.length)
      setResponses(arr)
    })
    return () => unsub()
  }, [session])

  const words = buildWordCloud(responses, 1920, 1080)

  return (
    <div style={styles.screen}>
      {/* Background grid */}
      <div style={styles.grid} />
      {/* Glow orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          XChange <span style={{ color: '#00C2FF' }}>LATAM</span>
        </div>
        <div style={styles.counter}>
          <span style={styles.counterNum}>{count}</span>
          <span style={styles.counterLabel}>respuestas</span>
        </div>
      </div>

      {/* Question */}
      <div style={styles.questionBar}>
        <p style={styles.questionText}>
          {session?.question || '¿Qué esperás llevarte de este evento?'}
        </p>
      </div>

      {/* Word cloud */}
      <div style={styles.cloudArea}>
        {words.length === 0 ? (
          <div style={styles.waiting}>
            <div style={styles.waitingPulse} />
            <p style={styles.waitingText}>Esperando respuestas...</p>
            <p style={styles.waitingHint}>Escaneá el QR para participar</p>
          </div>
        ) : (
          <div style={styles.wordWrap}>
            {words.map((w, i) => (
              <Word key={w.id} item={w} delay={i * 80} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerText}>xchange.lat</span>
        <div style={styles.live}>
          <span style={styles.liveDot} />
          LIVE
        </div>
      </div>
    </div>
  )
}

const styles = {
  screen: {
    width: '100vw',
    height: '100vh',
    background: '#060810',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,194,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,194,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    zIndex: 0,
  },
  orb1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,194,255,0.12) 0%, transparent 70%)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,60,172,0.10) 0%, transparent 70%)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 3rem',
    zIndex: 10,
    borderBottom: '1px solid rgba(0,194,255,0.1)',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    letterSpacing: '0.08em',
    color: '#fff',
  },
  counter: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
  },
  counterNum: {
    fontFamily: 'var(--font-display)',
    fontSize: '3rem',
    color: '#00C2FF',
    lineHeight: 1,
  },
  counterLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.05em',
  },
  questionBar: {
    padding: '1.5rem 3rem 0.5rem',
    zIndex: 10,
  },
  questionText: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.4rem',
    letterSpacing: '0.04em',
    color: '#fff',
    opacity: 0.9,
  },
  cloudArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem 2rem',
    zIndex: 10,
    overflow: 'hidden',
  },
  wordWrap: {
    textAlign: 'center',
    lineHeight: 1.3,
    maxWidth: '90vw',
  },
  waiting: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  waitingPulse: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '2px solid rgba(0,194,255,0.4)',
    animation: 'pulse 2s infinite',
  },
  waitingText: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.5rem',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.05em',
  },
  waitingHint: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.2)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 3rem',
    zIndex: 10,
    borderTop: '1px solid rgba(0,194,255,0.1)',
  },
  footerText: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.08em',
  },
  live: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 500,
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#00F0A0',
    boxShadow: '0 0 8px #00F0A0',
    animation: 'blink 1.5s infinite',
  },
}

// Inject keyframes
const style = document.createElement('style')
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.15); opacity: 0.8; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }
`
document.head.appendChild(style)
