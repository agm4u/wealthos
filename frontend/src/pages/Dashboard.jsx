import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getSummary, updateMeta, updateTransfer, createTransfer, deleteTransfer } from '../api/client'
import { fmt, fmtFull, CAT_COLORS, EditableCell, EditableNumber, Spinner, Modal } from '../components/shared'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-300">{payload[0].name}</p>
      <p className="text-gold font-medium">{fmt(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addTransfer, setAddTransfer] = useState(false)
  const [newTransfer, setNewTransfer] = useState({ bank: '', amount: '' })

  const load = () => getSummary().then(d => { setData(d); setLoading(false) })
  useEffect(() => { load() }, [])

  if (loading) return <Spinner />
  if (!data) return null

  const pieData = Object.entries(data.by_category)
    .filter(([, v]) => v.value > 0)
    .map(([cat, v]) => ({ name: cat, value: Math.round(v.value) }))
    .sort((a, b) => b.value - a.value)

  const barData = Object.entries(data.by_category)
    .filter(([, v]) => v.monthly > 0)
    .map(([cat, v]) => ({ name: cat, amount: Math.round(v.monthly) }))
    .sort((a, b) => b.amount - a.amount)

  const total = data.total_portfolio

  const saveDate = (val) => updateMeta('valuation_date', val).then(load)
  const saveTransfer = (id, field, val) =>
    updateTransfer(id, { bank: data.transfers.find(t => t.id === id)?.bank, amount: data.transfers.find(t => t.id === id)?.amount, [field]: val }).then(load)
  const delTransfer = (id) => deleteTransfer(id).then(load)
  const addT = () => {
    if (!newTransfer.bank || !newTransfer.amount) return
    createTransfer({ bank: newTransfer.bank, amount: parseFloat(newTransfer.amount) })
      .then(() => { setAddTransfer(false); setNewTransfer({ bank: '', amount: '' }); load() })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
        <div>
          <h1 className="serif text-2xl" style={{ color: 'var(--gold)' }}>Investment Dashboard</h1>
          <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            Valuation as of{' '}
            <EditableCell value={data.valuation_date} onSave={saveDate} className="text-gray-400" />
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full border" style={{ backgroundColor: 'rgba(34,197,94,0.3)', color: '#4ade80', borderColor: 'rgba(34,197,94,0.4)' }}>Live</span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Portfolio', value: fmt(total), sub: 'All assets combined', gold: true },
          { label: 'Monthly Invested', value: fmt(data.monthly_investment), sub: 'SIPs + recurring' },
          { label: 'Monthly Transfer In', value: fmt(data.monthly_transfer_in), sub: 'Across all banks' },
          { label: 'No. of Assets', value: Object.values(data.by_category).reduce((s, v) => s + v.count, 0), sub: 'Individual entries' },
        ].map(c => (
          <div key={c.label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
            <p className="text-2xl font-light" style={{ color: c.gold ? 'var(--gold)' : 'var(--text-primary)' }}>{c.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>Portfolio Allocation</p>
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" nameKey="name" paddingAngle={2}>
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={CAT_COLORS[entry.name] || '#555'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 flex-1">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CAT_COLORS[d.name] || '#555' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                  </span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">{((d.value / total) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>Monthly Investments by Category</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => '₹' + (v / 1000) + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {barData.map(d => <Cell key={d.name} fill={CAT_COLORS[d.name] || '#555'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category summary table */}
      <div className="rounded-xl mb-6 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Asset Summary</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click any row to manage investments</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-accent)' }}>
              {['Category', 'Current Value', '% of Portfolio', 'Monthly SIP', 'Entries'].map(h => (
                <th key={h} className="text-left px-5 py-2.5 text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.by_category)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([cat, v]) => (
                <tr key={cat} className="inv-row cursor-pointer" style={{ borderTop: '1px solid var(--border)' }}
                  onClick={() => onNavigate(cat)}>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[cat] || '#555' }} />
                      <span style={{ color: 'var(--text-primary)' }}>{cat}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--gold)' }}>{fmt(v.value)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min((v.value / total) * 100, 100)}%`, background: CAT_COLORS[cat] || '#555' }} />
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{((v.value / total) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{v.monthly > 0 ? fmt(v.monthly) : '—'}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>{v.count}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Monthly transfers */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Monthly Transfer IN by Bank</p>
          <button onClick={() => setAddTransfer(true)}
            className="text-xs px-3 py-1 rounded-lg transition-colors" style={{ color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
            + Add
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-accent)' }}>
              {['Bank', 'Amount (₹)', ''].map(h => (
                <th key={h} className="text-left px-5 py-2.5 text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.transfers.map(t => (
              <tr key={t.id} className="inv-row" style={{ borderTop: '1px solid var(--border)' }}>
                <td className="px-5 py-3">
                  <EditableCell value={t.bank} onSave={val => saveTransfer(t.id, 'bank', val)} style={{ color: 'var(--text-primary)' }} />
                </td>
                <td className="px-5 py-3">
                  <EditableNumber value={t.amount} onSave={val => saveTransfer(t.id, 'amount', val)} style={{ color: 'var(--gold)' }} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => delTransfer(t.id)} className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>Remove</button>
                </td>
              </tr>
            ))}
            <tr style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-accent)' }}>
              <td className="px-5 py-2.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total</td>
              <td className="px-5 py-2.5 font-medium" style={{ color: 'var(--gold)' }}>{fmtFull(data.monthly_transfer_in)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {addTransfer && (
        <Modal title="Add Monthly Transfer" onClose={() => setAddTransfer(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Bank</label>
              <input className="editing-input w-full" placeholder="e.g. HDFC" value={newTransfer.bank}
                onChange={e => setNewTransfer(p => ({ ...p, bank: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Amount (₹)</label>
              <input className="editing-input w-full" type="number" placeholder="50000" value={newTransfer.amount}
                onChange={e => setNewTransfer(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddTransfer(false)}
                className="flex-1 py-2 text-sm text-gray-400 border border-[#333] rounded-lg hover:bg-[#222]">Cancel</button>
              <button onClick={addT}
                className="flex-1 py-2 text-sm bg-gold text-black font-medium rounded-lg hover:bg-gold/90">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
