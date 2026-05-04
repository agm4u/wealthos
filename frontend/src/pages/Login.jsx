import { useState } from 'react'

const PASSWORD = 'wealthos2026'   // ← change this to whatever you want

export default function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const attempt = () => {
    if (pw === PASSWORD) {
      sessionStorage.setItem('wealthos_auth', '1')
      onLogin()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const keyDown = (e) => {
    if (e.key === 'Enter') attempt()
    setError(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="serif text-4xl mb-2" style={{ color: 'var(--gold)' }}>WealthOS</h1>
          <p className="text-sm tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Personal Finance</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>Enter your password to continue</p>

          <input
            type="password"
            autoFocus
            placeholder="Password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false) }}
            onKeyDown={keyDown}
            className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors`}
            style={{
              backgroundColor: 'var(--bg-accent)',
              border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : 'var(--border)'}`,
              color: error ? 'var(--text-secondary)' : 'var(--text-primary)',
            }}
          />

          {error && (
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>Incorrect password</p>
          )}

          <button
            onClick={attempt}
            className="w-full mt-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-gold/90" style={{ backgroundColor: 'var(--gold)', color: 'black' }}>
            Unlock
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>Running locally · Your data stays on your machine</p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) }
          20%       { transform: translateX(-8px) }
          40%       { transform: translateX(8px) }
          60%       { transform: translateX(-5px) }
          80%       { transform: translateX(5px) }
        }
        .animate-shake { animation: shake 0.4s ease; }
      `}</style>
    </div>
  )
}
