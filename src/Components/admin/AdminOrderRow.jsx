import { useState } from 'react'
import { Loader2, Check, Eye } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'en attente',  label: 'En attente',  color: 'text-white/40' },
  { value: 'confirmé',    label: 'Confirmé',    color: 'text-blue-400' },
  { value: 'en livraison',label: 'En livraison',color: 'text-amber-400' },
  { value: 'livré',       label: 'Livré',       color: 'text-emerald-400' },
  { value: 'retour',      label: 'Retour',      color: 'text-orange-400' },
  { value: 'annulé',      label: 'Annulé',      color: 'text-red-400' },
]

const STATUS_DOT = {
  'en attente': 'bg-white/25', confirmé: 'bg-blue-400',
  'en livraison': 'bg-amber-400', livré: 'bg-emerald-400',
  retour: 'bg-orange-400', annulé: 'bg-red-400',
}

function AdminOrderRow({ order, onUpdated, onViewDetail }) {
  const [status, setStatus] = useState(order.status || 'en attente')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty]   = useState(false)

  const handleChange = (e) => {
    setStatus(e.target.value)
    setDirty(e.target.value !== order.status)
  }

  const handleSave = async (e) => {
    e.stopPropagation()
    setSaving(true)
    try {
      await api.put(`/orders/${order._id}`, { status })
      toast.success('Statut mis à jour')
      setDirty(false)
      onUpdated?.({ ...order, status })
    } catch {
      toast.error('Erreur mise à jour')
      setStatus(order.status)
      setDirty(false)
    } finally { setSaving(false) }
  }

  const date = new Date(order.createdAt).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  const currentOpt = STATUS_OPTIONS.find((o) => o.value === status)

  return (
    <tr
      onClick={onViewDetail}
      className="border-b border-white/5 hover:bg-amber-400/[0.04] transition-colors
                 cursor-pointer group"
    >
      {/* Client */}
      <td className="px-4 py-3.5">
        <p className="font-body font-semibold text-white text-sm group-hover:text-amber-400/90 transition-colors">
          {order.customerInfo.firstName} {order.customerInfo.lastName}
        </p>
        <p className="font-body text-white/30 text-xs mt-0.5">{order.customerInfo.phone}</p>
      </td>

      {/* Localisation */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <p className="font-body text-white/60 text-sm">{order.customerInfo.wilaya}</p>
        <p className="font-body text-white/30 text-xs">{order.customerInfo.commune}</p>
      </td>

      {/* Articles */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="space-y-1 max-w-[200px]">
          {order.items.map((item, i) => (
            <p key={i} className="font-body text-white/40 text-xs truncate">
              {item.quantity}× {item.name}{' '}
              <span className="text-white/20">/ {item.size}</span>
            </p>
          ))}
        </div>
      </td>

      {/* Total */}
      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        <span className="font-headline text-amber-400 text-base font-bold">
          {(order.total ?? 0).toLocaleString('fr-DZ')}
          <span className="text-xs text-white/25 font-body ml-1">DZD</span>
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3.5 hidden sm:table-cell font-body text-white/25 text-xs whitespace-nowrap">
        {date}
      </td>

      {/* Statut */}
      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={status} onChange={handleChange}
              className={`bg-transparent border border-white/10 text-xs font-label
                          uppercase tracking-[0.08rem] pl-3 pr-7 py-2 outline-none
                          focus:border-amber-400/30 appearance-none cursor-pointer
                          ${currentOpt?.color}`}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}
                  className="bg-[#1a1a1a] text-white normal-case tracking-normal">
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2
                             text-white/20 text-[14px] pointer-events-none"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>expand_more</span>
          </div>

          {dirty && (
            <button onClick={handleSave} disabled={saving}
              className="w-7 h-7 bg-amber-400 flex items-center justify-center
                         hover:bg-amber-300 transition-colors disabled:opacity-50">
              {saving
                ? <Loader2 size={11} className="animate-spin text-black" />
                : <Check size={11} className="text-black" />}
            </button>
          )}
        </div>
      </td>

      {/* Bouton voir détail */}
      <td className="px-2 py-3.5" onClick={(e) => { e.stopPropagation(); onViewDetail?.() }}>
        <button
          className="w-7 h-7 flex items-center justify-center
                     text-white/20 hover:text-amber-400 hover:bg-amber-400/10
                     transition-all rounded-sm"
          title="Voir les détails"
        >
          <Eye size={14} />
        </button>
      </td>
    </tr>
  )
}

export default AdminOrderRow