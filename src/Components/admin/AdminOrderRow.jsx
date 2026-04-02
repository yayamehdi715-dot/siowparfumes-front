// Components/admin/AdminOrderRow.jsx
import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'en attente', label: 'En attente', color: 'text-gray-400 border-gray-400/30 bg-gray-400/10' },
  { value: 'confirmé', label: 'Confirmé', color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
  { value: 'en livraison', label: 'En livraison', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
  { value: 'livré', label: 'Livré', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' },
  { value: 'retour', label: 'Retour', color: 'text-orange-400 border-orange-400/30 bg-orange-400/10' },
  { value: 'annulé', label: 'Annulé', color: 'text-red-400 border-red-400/30 bg-red-400/10' },
]

function AdminOrderRow({ order, onUpdated }) {
  const [status, setStatus] = useState(order.status || 'en attente')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    setDirty(e.target.value !== order.status)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/orders/${order._id}`, { status })
      toast.success('Statut mis à jour')
      setDirty(false)
      onUpdated?.({ ...order, status })
    } catch (err) {
      toast.error('Erreur lors de la mise à jour')
      setStatus(order.status)
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  const createdAt = new Date(order.createdAt).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <tr className="table-row">
      <td className="px-4 py-3">
        <p className="font-heading font-semibold text-brand-white text-sm">
          {order.customerInfo.firstName} {order.customerInfo.lastName}
        </p>
        <p className="text-brand-gray-500 text-xs mt-0.5">{order.customerInfo.phone}</p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <p className="text-brand-gray-300 text-sm">{order.customerInfo.wilaya}</p>
        <p className="text-brand-gray-500 text-xs">{order.customerInfo.commune}</p>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="space-y-1 max-w-[180px]">
          {order.items.map((item, i) => (
            <p key={i} className="text-brand-gray-400 text-xs truncate">
              {item.quantity}× {item.name}{' '}
              <span className="text-brand-gray-600">T{item.size}</span>
            </p>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <span className="font-headline text-lg text-brand-white">
          {(order.total ?? 0).toLocaleString('fr-DZ')}
          <span className="text-xs text-brand-gray-500 font-body ml-1">DA</span>
        </span>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell text-brand-gray-500 text-xs whitespace-nowrap">
        {createdAt}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={handleStatusChange}
            className="bg-brand-gray-900 border border-brand-gray-600 text-brand-white
                       text-xs font-heading font-semibold tracking-wider uppercase
                       pl-2 pr-6 py-1.5 outline-none focus:border-brand-red
                       appearance-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-7 h-7 bg-brand-red flex items-center justify-center
                         hover:bg-white hover:text-brand-black transition-colors
                         disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default AdminOrderRow