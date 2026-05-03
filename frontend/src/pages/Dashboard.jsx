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
          <h1 className="serif text-2xl text-gold">Investment Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            Valuation as of{' '}
            <EditableCell value={data.valuation_date} onSave={saveDate} className="text-gray-400" />
          </p>
        </div>
        <span className="text-xs px-3 py-1 bg-green-900/30 text-green-400 rounded-full border border-green-800/40">Live</span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Portfolio', value: fmt(total), sub: 'All assets combined', gold: true },
          { label: 'Monthly Invested', value: fmt(data.monthly_investment), sub: 'SIPs + recurring' },
          { label: 'Monthly Transfer In', value: fmt(data.monthly_transfer_in), sub: 'Across all banks' },
          { label: 'No. of Assets', value: Object.values(data.by_category).reduce((s, v) => s + v.count, 0), sub: 'Individual entries' },
        ].map(c => (
          <div key={c.label} className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{c.label}</p>
            <p className={`text-2xl font-light ${c.gold ? 'text-gold' : 'text-gray-100'}`}>{c.value}</p>
            <p className="text-xs text-gray-600 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Portfolio Allocation</p>
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
                    <span className="text-gray-400">{d.name}</span>
                  </span>
                  <span className="text-gray-300 font-medium">{((d.value / total) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Monthly Investments by Category</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
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
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl mb-6 overflow-hidden">
        <div className="flex justify-between items-center px-5 py-3 border-b border-[#2a2a2a]">
          <p className="text-sm font-medium text-gray-300">Asset Summary</p>
          <p className="text-xs text-gray-600">Click any row to manage investments</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a]">
              {['Category', 'Current Value', '% of Portfolio', 'Monthly SIP', 'Entries'].map(h => (
                <th key={h} className="text-left px-5 py-2.5 text-xs text-gray-600 uppercase tracking-wide font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.by_category)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([cat, v]) => (
                <tr key={cat} className="border-t border-[#1e1e1e] inv-row cursor-pointer"
                  onClick={() => onNavigate(cat)}>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[cat] || '#555' }} />
                      <span className="text-gray-200">{cat}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gold font-medium">{fmt(v.value)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min((v.value / total) * 100, 100)}%`, background: CAT_COLORS[cat] || '#555' }} />
                      </div>
                      <span className="text-gray-400 text-xs">{((v.value / total) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{v.monthly > 0 ? fmt(v.monthly) : '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{v.count}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Monthly transfers */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-5 py-3 border-b border-[#2a2a2a]">
          <p className="text-sm font-medium text-gray-300">Monthly Transfer IN by Bank</p>
          <button onClick={() => setAddTransfer(true)}
            className="text-xs text-gold border border-gold/30 px-3 py-1 rounded-lg hover:bg-gold/10 transition-colors">
            + Add
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a]">
              {['Bank', 'Amount (₹)', ''].map(h => (
                <th key={h} className="text-left px-5 py-2.5 text-xs text-gray-600 uppercase tracking-wide font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.transfers.map(t => (
              <tr key={t.id} className="border-t border-[#1e1e1e] inv-row">
                <td className="px-5 py-3">
                  <EditableCell value={t.bank} onSave={val => saveTransfer(t.id, 'bank', val)} className="text-gray-200" />
                </td>
                <td className="px-5 py-3">
                  <EditableNumber value={t.amount} onSave={val => saveTransfer(t.id, 'amount', val)} className="text-gold" />
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => delTransfer(t.id)} className="text-gray-700 hover:text-red-400 text-xs transition-colors">Remove</button>
                </td>
              </tr>
            ))}
            <tr className="border-t border-[#2a2a2a] bg-[#1a1a1a]">
              <td className="px-5 py-2.5 text-xs font-medium text-gray-400">Total</td>
              <td className="px-5 py-2.5 text-gold font-medium">{fmtFull(data.monthly_transfer_in)}</td>
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
