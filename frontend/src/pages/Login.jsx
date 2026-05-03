import { useState } from 'react'

const PASSWORD = 'wealthos2024'   // ← change this to whatever you want

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
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="serif text-gold text-4xl mb-2">WealthOS</h1>
          <p className="text-gray-600 text-sm tracking-widest uppercase">Personal Finance</p>
        </div>

        {/* Card */}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8">
          <p className="text-gray-400 text-sm mb-6 text-center">Enter your password to continue</p>

          <input
            type="password"
            autoFocus
            placeholder="Password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false) }}
            onKeyDown={keyDown}
            className={`w-full bg-[#1e1e1e] border rounded-xl px-4 py-3 text-gray-100 text-sm outline-none transition-colors placeholder-gray-700
              ${error ? 'border-red-500/60 text-red-400' : 'border-[#333] focus:border-gold'}`}
          />

          {error && (
            <p className="text-red-400 text-xs mt-2 text-center">Incorrect password</p>
          )}

          <button
            onClick={attempt}
            className="w-full mt-4 bg-gold hover:bg-gold/90 text-black font-medium py-3 rounded-xl text-sm transition-colors">
            Unlock
          </button>
        </div>

        <p className="text-center text-gray-800 text-xs mt-6">Running locally · Your data stays on your machine</p>
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
