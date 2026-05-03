import { useState } from 'react'
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

  const logout = () => { sessionStorage.removeItem('wealthos_auth'); setAuthed(false) }
  const navigate = (cat) => { setCatFilter(cat); setPage('investments') }
  const goTo = (p, cat = null) => { setPage(p); setCatFilter(cat) }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f0f]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-52' : 'w-0 overflow-hidden'} flex-shrink-0 bg-[#141414] border-r border-[#1e1e1e] flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#1e1e1e]">
          <div className="serif text-gold text-lg leading-tight">WealthOS</div>
          <div className="text-gray-600 text-xs tracking-widest uppercase mt-0.5">Personal Finance</div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {/* Dashboard */}
          <button
            onClick={() => goTo('dashboard')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all border-l-2 ${page === 'dashboard' ? 'nav-active' : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#1a1a1a]'}`}>
            {NAV_ICONS.dashboard}
            Dashboard
          </button>

          {/* All investments */}
          <button
            onClick={() => goTo('investments', null)}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all border-l-2 ${page === 'investments' && !catFilter ? 'nav-active' : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#1a1a1a]'}`}>
            {NAV_ICONS.all}
            All Investments
          </button>

          <div className="px-4 pt-4 pb-1">
            <span className="text-xs text-gray-700 uppercase tracking-widest">By Category</span>
          </div>

          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => goTo('investments', cat)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all border-l-2 ${page === 'investments' && catFilter === cat ? 'nav-active' : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#1a1a1a]'}`}>
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CAT_COLORS[cat] || '#555' }} />
              {cat}
            </button>
          ))}
        </nav>

        <div className="px-5 py-3 border-t border-[#1e1e1e] flex items-center justify-between">
          <p className="text-xs text-gray-700">Local · Docker</p>
          <button onClick={logout} className="text-xs text-gray-700 hover:text-red-400 transition-colors">Lock</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-12 flex items-center px-5 border-b border-[#1e1e1e] bg-[#141414] gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(p => !p)}
            className="text-gray-600 hover:text-gray-300 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="text-gray-600 text-sm">
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
