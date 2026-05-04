import { useState, useRef, useEffect } from 'react'

export const fmt = (n) => {
  if (!n && n !== 0) return '—'
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr'
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

export const fmtFull = (n) =>
  '₹' + Math.round(n || 0).toLocaleString('en-IN')

export const CAT_COLORS = {
  MF: '#378ADD', FD: '#BA7517', Bond: '#0F6E56',
  NPS: '#534AB7', PPF: '#1D9E75', EPF: '#3B6D11',
  Gold: '#EF9F27', Shares: '#D4537E', ETF: '#E24B4A',
  US: '#7F77DD', Crypto: '#888780',
  'Bank Accounts': '#2D9CDB',
}

export const CAT_BG = {
  MF: 'bg-blue-900/30 text-blue-300',
  FD: 'bg-amber-900/30 text-amber-300',
  Bond: 'bg-teal-900/30 text-teal-300',
  NPS: 'bg-purple-900/30 text-purple-300',
  PPF: 'bg-emerald-900/30 text-emerald-300',
  EPF: 'bg-green-900/30 text-green-300',
  Gold: 'bg-yellow-900/30 text-yellow-300',
  Shares: 'bg-pink-900/30 text-pink-300',
  ETF: 'bg-red-900/30 text-red-300',
  US: 'bg-indigo-900/30 text-indigo-300',
  Crypto: 'bg-gray-700/50 text-gray-300',
  'Bank Accounts': 'bg-sky-900/30 text-sky-300',
}

export function EditableCell({ value, onSave, type = 'text', className = '' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const ref = useRef()

  useEffect(() => { setVal(value) }, [value])
  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    const parsed = type === 'number' ? parseFloat(val) || 0 : val
    if (parsed !== value) onSave(parsed)
  }

  const keyDown = (e) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setVal(value); setEditing(false) }
  }

  if (editing) return (
    <input
      ref={ref}
      className={`editing-input ${className}`}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={keyDown}
      type={type === 'number' ? 'number' : 'text'}
      style={{ minWidth: 80 }}
    />
  )

  return (
    <span className={`editable ${className}`} onClick={() => setEditing(true)} title="Click to edit">
      {value || '—'}
    </span>
  )
}

export function EditableNumber({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const ref = useRef()

  useEffect(() => { setVal(value) }, [value])
  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    const parsed = parseFloat(val) || 0
    if (parsed !== value) onSave(parsed)
  }

  const keyDown = (e) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setVal(value); setEditing(false) }
  }

  if (editing) return (
    <input
      ref={ref}
      className={`editing-input ${className}`}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={keyDown}
      type="number"
      style={{ minWidth: 100 }}
    />
  )

  return (
    <span className={`editable ${className}`} onClick={() => setEditing(true)} title="Click to edit">
      {fmtFull(value)}
    </span>
  )
}

export function Tag({ cat }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${CAT_BG[cat] || 'bg-gray-700 text-gray-300'}`}>
      {cat}
    </span>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="serif text-gold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )
}

export const CATEGORIES = ['MF', 'FD', 'Bond', 'NPS', 'PPF', 'EPF', 'Gold', 'Shares', 'ETF', 'US', 'Crypto', 'Bank Accounts']
