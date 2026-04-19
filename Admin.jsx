import React, { useState, useEffect } from 'react'
import { db } from './firebase'
import { ref, set, remove, onValue, get } from 'firebase/database'

const SESSIONS = [
  { id: 'apertura', label: 'Apertura del evento', question: '¿Qué esperás llevarte de XChange LATAM?' },
  { id: 'networking', label: 'Networking / break', question: '¿Con quién querés conectar hoy?' },
  { id: 'cierre', label: 'Cierre', question: '¿Cuál es tu principal aprendizaje del día?' },
  { id: 'custom', label: 'Pregunta personalizada', question: '' },
]

export default function Admin() {
  const [activeSession, setActiveSession] = useState(null)
  const [customQ, setCustomQ] = useState('')
  const [counts, setCounts] = useState({})
  const [clearing, setClearing] = useState(false)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    const unsub = onValue(ref(db, 'activeSession'), snap => setActiveSession(snap.val()))
    return () => unsub()
  }, [])

  useEffect(() => {
    SESSIONS.forEach(s => {
      onValue(ref(db, `responses/${s.id}`), snap => {
        const data = snap.val()
        setCounts(prev => ({ ...prev, [s.id]: data ? Object.keys(data).length : 0 }))
      })
    })
  }, [])

  const activate = async (session) => {
    const q = session.id === 'custom' ? customQ : session.question
    await set(ref(db, 'activeSession'), { id: session.id, question: q })
  }

  const clearSession = async (sessionId) => {
    if (!confirm('¿Borrar todas las respuestas de esta sesión?')) return
    setClearing(true)
    await remove(ref(db, `responses/${sessionId}`))
    setClearing(false)
  }

  const copyURL = (path) => {
    const url = `${window.location.origin}${path}`
    navigator.clipboard.writeText(url)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.logo}>XChange <span style={{ color: '#00C2FF' }}>LATAM</span> — Admin</div>

        {/* URLs */}
        <div style={s.section}>
          <p style={s.sectionTitle}>URLs</p>
          <div style={s.urlRow}>
            <code style={s.code}>{window.location.origin}/</code>
            <span style={s.badge}>Audiencia (QR)</span>
            <button style={s.copyBtn} onClick={() => copyURL('/')}>Copiar</button>
          </div>
          <div style={s.urlRow}>
            <code style={s.code}>{window.location.origin}/screen</code>
            <span style={{ ...s.badge, background: 'rgba(255,60,172,0.15)', color: '#FF3CAC' }}>Pantalla proyectora</span>
            <button style={s.copyBtn} onClick={() => copyURL('/screen')}>Copiar</button>
          </div>
        </div>

        {/* Session selector */}
        <div style={s.section}>
          <p style={s.sectionTitle}>Sesión activa</p>
          <div style={s.sessionGrid}>
            {SESSIONS.map(session => {
              const isActive = activeSession?.id === session.id
              return (
                <div key={session.id} style={{ ...s.sessionCard, ...(isActive ? s.sessionActive : {}) }}>
                  <div style={s.sessionTop}>
                    <span style={s.sessionLabel}>{session.label}</span>
                    <span style={s.sessionCount}>{counts[session.id] || 0} resp.</span>
                  </div>
                  {session.id === 'custom' ? (
                    <input
                      value={customQ}
                      onChange={e => setCustomQ(e.target.value)}
                      placeholder="Escribí tu pregunta..."
                      style={s.customInput}
                    />
                  ) : (
                    <p style={s.sessionQ}>{session.question}</p>
                  )}
                  <div style={s.sessionActions}>
                    <button
                      onClick={() => activate(session)}
                      style={{ ...s.btn, ...(isActive ? s.btnActive : {}) }}
                    >
                      {isActive ? '✓ Activa' : 'Activar'}
                    </button>
                    <button
                      onClick={() => clearSession(session.id)}
                      style={s.btnDanger}
                      disabled={clearing}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current state */}
        {activeSession && (
          <div style={s.status}>
            <span style={s.liveDot} />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              Sesión activa: <strong style={{ color: '#fff' }}>{activeSession.question}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#060810',
    padding: '2rem',
    fontFamily: 'var(--font-body)',
  },
  wrap: {
    maxWidth: '780px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    color: '#fff',
    letterSpacing: '0.05em',
  },
  section: {
    background: 'rgba(13,17,32,0.9)',
    border: '1px solid rgba(0,194,255,0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    fontWeight: 500,
  },
  urlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    color: '#00C2FF',
    background: 'rgba(0,194,255,0.08)',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  badge: {
    fontSize: '0.75rem',
    background: 'rgba(0,194,255,0.12)',
    color: '#00C2FF',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  copyBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.5)',
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  sessionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  sessionCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'border-color 0.2s',
  },
  sessionActive: {
    border: '1px solid rgba(0,194,255,0.5)',
    background: 'rgba(0,194,255,0.05)',
  },
  sessionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#fff',
  },
  sessionCount: {
    fontSize: '0.75rem',
    color: '#00C2FF',
    background: 'rgba(0,194,255,0.1)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  sessionQ: {
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 1.4,
  },
  customInput: {
    background: 'rgba(0,194,255,0.06)',
    border: '1px solid rgba(0,194,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    padding: '0.5rem 0.75rem',
    outline: 'none',
    width: '100%',
  },
  sessionActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  btn: {
    flex: 1,
    background: 'rgba(0,194,255,0.12)',
    border: '1px solid rgba(0,194,255,0.3)',
    borderRadius: '8px',
    color: '#00C2FF',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    padding: '0.5rem',
    cursor: 'pointer',
    fontWeight: 500,
  },
  btnActive: {
    background: 'rgba(0,194,255,0.25)',
    borderColor: '#00C2FF',
  },
  btnDanger: {
    background: 'rgba(255,60,172,0.08)',
    border: '1px solid rgba(255,60,172,0.2)',
    borderRadius: '8px',
    color: '#FF3CAC',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'rgba(0,240,160,0.05)',
    border: '1px solid rgba(0,240,160,0.15)',
    borderRadius: '10px',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#00F0A0',
    boxShadow: '0 0 8px #00F0A0',
    display: 'inline-block',
    flexShrink: 0,
  },
}
