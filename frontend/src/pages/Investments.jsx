import { useEffect, useState } from 'react'
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '../api/client'
import { fmt, fmtFull, Tag, EditableCell, EditableNumber, Spinner, Modal, CATEGORIES, CAT_COLORS } from '../components/shared'

const EMPTY_FORM = { category: 'MF', name: '', platform: '', bank_account: '', current_value: '', monthly_amount: '', notes: '' }

export default function InvestmentsPage({ filterCategory }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM, category: filterCategory || 'MF' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getInvestments(filterCategory || null).then(d => { setItems(d); setLoading(false) })
  }

  useEffect(() => { load() }, [filterCategory])

  const patch = (id, field, val) =>
    updateInvestment(id, { [field]: val }).then(load)

  const del = (id) => {
    if (!confirm('Delete this entry?')) return
    deleteInvestment(id).then(load)
  }

  const add = () => {
    if (!form.name) return
    setSaving(true)
    createInvestment({
      ...form,
      current_value: parseFloat(form.current_value) || 0,
      monthly_amount: parseFloat(form.monthly_amount) || 0,
    }).then(() => { setSaving(false); setShowAdd(false); setForm({ ...EMPTY_FORM, category: filterCategory || 'MF' }); load() })
  }

  const totalValue = items.reduce((s, i) => s + i.current_value, 0)
  const totalMonthly = items.reduce((s, i) => s + i.monthly_amount, 0)

  const grouped = filterCategory
    ? { [filterCategory]: items }
    : items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
      }, {})

  return (
    <div>
      <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
        <div>
          <h1 className="serif text-2xl" style={{ color: filterCategory ? CAT_COLORS[filterCategory] : '#C9A84C' }}>
            {filterCategory || 'All Investments'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} entries · {fmt(totalValue)} total</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="text-sm bg-gold text-black font-medium px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors">
          + Add Entry
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Value</p>
          <p className="text-xl font-light text-gold">{fmt(totalValue)}</p>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly Investment</p>
          <p className="text-xl font-light text-gray-100">{totalMonthly > 0 ? fmt(totalMonthly) : '—'}</p>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Entries</p>
          <p className="text-xl font-light text-gray-100">{items.length}</p>
        </div>
      </div>

      {loading ? <Spinner /> : (
        Object.entries(grouped).map(([cat, rows]) => (
          <div key={cat} className="bg-[#161616] border border-[#2a2a2a] rounded-xl mb-4 overflow-hidden">
            {!filterCategory && (
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#2a2a2a] bg-[#1a1a1a]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[cat] || '#555' }} />
                <span className="text-sm font-medium text-gray-300">{cat}</span>
                <span className="text-xs text-gray-600 ml-auto">{fmt(rows.reduce((s, i) => s + i.current_value, 0))}</span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1a1a1a]">
                    {['Name', 'Platform', 'Bank Account', 'Current Value (₹)', 'Monthly (₹)', 'Notes', ''].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs text-gray-600 uppercase tracking-wide font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, idx) => (
                    <tr key={item.id} className={`inv-row border-t border-[#1e1e1e] ${idx % 2 === 1 ? 'bg-[#181818]' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-200">
                        <EditableCell value={item.name} onSave={v => patch(item.id, 'name', v)} />
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        <EditableCell value={item.platform || ''} onSave={v => patch(item.id, 'platform', v)} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <EditableCell value={item.bank_account || ''} onSave={v => patch(item.id, 'bank_account', v)} />
                      </td>
                      <td className="px-4 py-3">
                        <EditableNumber value={item.current_value} onSave={v => patch(item.id, 'current_value', v)} className="text-gold" />
                      </td>
                      <td className="px-4 py-3">
                        <EditableNumber value={item.monthly_amount} onSave={v => patch(item.id, 'monthly_amount', v)} className="text-green-400" />
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        <EditableCell value={item.notes || ''} onSave={v => patch(item.id, 'notes', v)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => del(item.id)} className="text-gray-700 hover:text-red-400 text-xs transition-colors">✕</button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-[#2a2a2a] bg-[#1a1a1a]">
                    <td colSpan={3} className="px-4 py-2 text-xs text-gray-600 font-medium">Subtotal</td>
                    <td className="px-4 py-2 text-gold text-xs font-medium">{fmtFull(rows.reduce((s, i) => s + i.current_value, 0))}</td>
                    <td className="px-4 py-2 text-green-400 text-xs">{rows.reduce((s, i) => s + i.monthly_amount, 0) > 0 ? fmtFull(rows.reduce((s, i) => s + i.monthly_amount, 0)) : '—'}</td>
                    <td colSpan={2} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {showAdd && (
        <Modal title="Add Investment Entry" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Category</label>
                <select className="editing-input w-full" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Name *</label>
                <input className="editing-input w-full" placeholder="e.g. Parag Parikh Fund" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Platform / App</label>
                <input className="editing-input w-full" placeholder="e.g. ET Money" value={form.platform}
                  onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Bank Account</label>
                <input className="editing-input w-full" placeholder="e.g. SBI" value={form.bank_account}
                  onChange={e => setForm(p => ({ ...p, bank_account: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Current Value (₹)</label>
                <input className="editing-input w-full" type="number" placeholder="500000" value={form.current_value}
                  onChange={e => setForm(p => ({ ...p, current_value: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Monthly Amount (₹)</label>
                <input className="editing-input w-full" type="number" placeholder="5000" value={form.monthly_amount}
                  onChange={e => setForm(p => ({ ...p, monthly_amount: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Notes</label>
              <input className="editing-input w-full" placeholder="Optional notes" value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2 text-sm text-gray-400 border border-[#333] rounded-lg hover:bg-[#222]">Cancel</button>
              <button onClick={add} disabled={saving || !form.name}
                className="flex-1 py-2 text-sm bg-gold text-black font-medium rounded-lg hover:bg-gold/90 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
