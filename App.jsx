import React, { useState, useEffect } from 'react'
import { db } from './firebase'
import { ref, push, onValue, serverTimestamp } from 'firebase/database'

export default function App() {
  const [word, setWord] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')

  // Obtener sesión activa
  useEffect(() => {
    const sessionRef = ref(db, 'activeSession')
    const unsub = onValue(sessionRef, (snap) => {
      setSession(snap.val())
    })
    return () => unsub()
  }, [])

  const handleSubmit = async () => {
    const trimmed = word.trim()
    if (!trimmed) return
    if (trimmed.length > 80) {
      setError('Máximo 80 caracteres')
      return
    }
    setSending(true)
    try {
      const sessionId = session?.id || 'default'
      await push(ref(db, `responses/${sessionId}`), {
        text: trimmed,
        ts: serverTimestamp()
      })
      setSent(true)
    } catch (e) {
      setError('Error al enviar. Intentá de nuevo.')
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  if (sent) {
    return (
      <div style={styles.page}>
        <div style={styles.successBox}>
          <div style={styles.checkmark}>✓</div>
          <p style={styles.successTitle}>¡Gracias!</p>
          <p style={styles.successSub}>Tu respuesta ya está en pantalla.</p>
          <div style={styles.logo}>XChange <span style={styles.logoAccent}>LATAM</span></div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>XChange <span style={styles.logoAccent}>LATAM</span></div>

        {session?.question ? (
          <p style={styles.question}>{session.question}</p>
        ) : (
          <p style={styles.question}>¿Qué esperás llevarte de este evento?</p>
        )}

        <p style={styles.hint}>Escribí una palabra o frase corta</p>

        <textarea
          value={word}
          onChange={e => { setWord(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Conexiones, Ideas nuevas, Crecer..."
          maxLength={80}
          rows={3}
          style={styles.textarea}
          autoFocus
        />

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.charCount}>{word.length}/80</div>

        <button
          onClick={handleSubmit}
          disabled={!word.trim() || sending}
          style={{
            ...styles.button,
            opacity: (!word.trim() || sending) ? 0.4 : 1,
            cursor: (!word.trim() || sending) ? 'not-allowed' : 'pointer'
          }}
        >
          {sending ? 'Enviando...' : 'Enviar →'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,194,255,0.12) 0%, #060810 60%)',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: 'rgba(13,17,32,0.95)',
    border: '1px solid rgba(0,194,255,0.25)',
    borderRadius: '20px',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    boxShadow: '0 0 60px rgba(0,194,255,0.08)',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.6rem',
    letterSpacing: '0.05em',
    color: '#fff',
    textAlign: 'center',
  },
  logoAccent: {
    color: 'var(--accent)',
  },
  question: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.7rem',
    letterSpacing: '0.02em',
    color: '#fff',
    lineHeight: 1.2,
    textAlign: 'center',
  },
  hint: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
  textarea: {
    width: '100%',
    background: 'rgba(0,194,255,0.06)',
    border: '1px solid rgba(0,194,255,0.3)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1.1rem',
    fontFamily: 'var(--font-body)',
    padding: '1rem',
    resize: 'none',
    outline: 'none',
    lineHeight: 1.5,
    transition: 'border-color 0.2s',
  },
  charCount: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'right',
    marginTop: '-0.75rem',
  },
  button: {
    background: 'linear-gradient(135deg, #00C2FF, #0080FF)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontFamily: 'var(--font-body)',
    fontSize: '1.05rem',
    fontWeight: 600,
    padding: '0.9rem',
    transition: 'transform 0.15s, opacity 0.2s',
    letterSpacing: '0.03em',
  },
  error: {
    fontSize: '0.85rem',
    color: '#FF3CAC',
    textAlign: 'center',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '3rem 2rem',
    background: 'rgba(13,17,32,0.95)',
    border: '1px solid rgba(0,194,255,0.25)',
    borderRadius: '20px',
    maxWidth: '360px',
    width: '100%',
  },
  checkmark: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(0,194,255,0.15)',
    border: '2px solid var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    color: 'var(--accent)',
  },
  successTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.5rem',
    letterSpacing: '0.05em',
  },
  successSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '1rem',
    textAlign: 'center',
  },
}
