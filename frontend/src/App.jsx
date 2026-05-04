import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import InvestmentsPage from './pages/Investments'
import { CATEGORIES, CAT_COLORS } from './components/shared'

const NAV_ICONS = {
  dashboard: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".8"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".3"/></svg>,
  all: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
}

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('wealthos_auth') === '1')
  const [page, setPage] = useState('dashboard')
  const [catFilter, setCatFilter] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('wealthos_theme') || 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('wealthos_theme', theme)
  }, [theme])

  const logout = () => { sessionStorage.removeItem('wealthos_auth'); setAuthed(false) }
  const navigate = (cat) => { setCatFilter(cat); setPage('investments') }
  const goTo = (p, cat = null) => { setPage(p); setCatFilter(cat) }
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (!authed) return <Login onLogin={() => setAuthed(true)} />

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-52' : 'w-0 overflow-hidden'} flex-shrink-0 flex flex-col transition-all duration-200`} style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="serif text-lg leading-tight" style={{ color: 'var(--gold)' }}>WealthOS</div>
          <div className="text-xs tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>Personal Finance</div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {/* Dashboard */}
          <button
            onClick={() => goTo('dashboard')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all border-l-2 ${page === 'dashboard' ? 'nav-active' : 'border-transparent hover:bg-[var(--bg-hover)]'}`} style={{ color: page === 'dashboard' ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {NAV_ICONS.dashboard}
            Dashboard
          </button>

          {/* All investments */}
          <button
            onClick={() => goTo('investments', null)}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all border-l-2 ${page === 'investments' && !catFilter ? 'nav-active' : 'border-transparent hover:bg-[var(--bg-hover)]'}`} style={{ color: page === 'investments' && !catFilter ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {NAV_ICONS.all}
            All Investments
          </button>

          <div className="px-4 pt-4 pb-1">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>By Category</span>
          </div>

          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => goTo('investments', cat)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all border-l-2 ${page === 'investments' && catFilter === cat ? 'nav-active' : 'border-transparent hover:bg-[var(--bg-hover)]'}`} style={{ color: page === 'investments' && catFilter === cat ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CAT_COLORS[cat] || '#555' }} />
              {cat}
            </button>
          ))}
        </nav>

        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Local · Docker</p>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button onClick={logout} className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>Lock</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-12 flex items-center px-5 gap-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
          <button onClick={() => setSidebarOpen(p => !p)}
            className="transition-colors" style={{ color: 'var(--text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {page === 'dashboard' ? 'Dashboard' : catFilter ? catFilter : 'All Investments'}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {page === 'investments' && <InvestmentsPage filterCategory={catFilter} />}
        </main>
      </div>
    </div>
  )
}
