import { useState, useEffect } from 'react'
import { Loader2, ChevronDown, ChevronUp, Search, X, Package } from 'lucide-react'
import api from '../../utils/api'
import AdminOrderRow from '../../Components/admin/AdminOrderRow'
import toast from 'react-hot-toast'

const STATUS_FILTERS = ['Tous', 'en attente', 'confirmé', 'en livraison', 'livré', 'retour', 'annulé']
const STATUS_LABELS  = {
  'en attente': 'En attente', confirmé: 'Confirmé', 'en livraison': 'En livraison',
  livré: 'Livré', retour: 'Retour', annulé: 'Annulé',
}
const STATUS_DOT = {
  'en attente': 'bg-white/25', confirmé: 'bg-blue-400',
  'en livraison': 'bg-amber-400', livré: 'bg-emerald-400',
  retour: 'bg-orange-400', annulé: 'bg-red-400',
}
const STATUS_BADGE = {
  'en attente': 'bg-white/10 text-white/50',
  confirmé:     'bg-blue-400/15 text-blue-400',
  'en livraison':'bg-amber-400/15 text-amber-400',
  livré:        'bg-emerald-400/15 text-emerald-400',
  retour:       'bg-orange-400/15 text-orange-400',
  annulé:       'bg-red-400/15 text-red-400',
}

// ── Modal détail commande ──────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onUpdated }) {
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)

  const date = new Date(order.createdAt).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const handleSaveStatus = async () => {
    if (status === order.status) return
    setSaving(true)
    try {
      await api.put(`/orders/${order._id}`, { status })
      toast.success('Statut mis à jour')
      onUpdated?.({ ...order, status })
      onClose()
    } catch {
      toast.error('Erreur mise à jour')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#161616] border border-white/10 w-full max-w-xl animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <p className="font-label text-[0.6rem] uppercase tracking-[0.2rem] text-white/30">Commande</p>
            <p className="font-headline text-white text-lg tracking-tight">
              {order.customerInfo.firstName} {order.customerInfo.lastName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-white/25 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Infos client */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/8 p-4">
              <p className="font-label text-[0.6rem] uppercase tracking-[0.15rem] text-amber-400/70 mb-3">
                Client
              </p>
              <p className="font-body text-white text-sm font-semibold">
                {order.customerInfo.firstName} {order.customerInfo.lastName}
              </p>
              <p className="font-body text-white/50 text-xs mt-1">{order.customerInfo.phone}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/8 p-4">
              <p className="font-label text-[0.6rem] uppercase tracking-[0.15rem] text-amber-400/70 mb-3">
                Livraison
              </p>
              <p className="font-body text-white text-sm font-semibold">
                {order.customerInfo.wilaya}
              </p>
              <p className="font-body text-white/50 text-xs mt-1">{order.customerInfo.commune}</p>
            </div>
          </div>

          {/* Articles */}
          <div>
            <p className="font-label text-[0.6rem] uppercase tracking-[0.15rem] text-white/30 mb-3">
              Articles ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i}
                  className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3">
                  {/* Image produit */}
                  <div className="w-12 h-14 bg-white/5 flex-shrink-0 overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-white/80 text-sm font-semibold truncate">
                      {item.name}
                    </p>
                    <p className="font-label text-[0.6rem] uppercase tracking-widest text-white/30 mt-0.5">
                      {item.size} · qté {item.quantity}
                    </p>
                  </div>
                  <p className="font-label text-[0.75rem] text-amber-400 font-semibold flex-shrink-0">
                    {((item.price ?? 0) * item.quantity).toLocaleString('fr-DZ')}
                    <span className="text-white/20 text-[0.6rem] ml-1">DZD</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total + date */}
          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <div>
              <p className="font-label text-[0.6rem] uppercase tracking-[0.15rem] text-white/25">Date</p>
              <p className="font-body text-white/40 text-xs mt-0.5">{date}</p>
            </div>
            <div className="text-right">
              <p className="font-label text-[0.6rem] uppercase tracking-[0.15rem] text-white/25">Total</p>
              <p className="font-headline text-amber-400 text-2xl font-bold mt-0.5">
                {(order.total ?? 0).toLocaleString('fr-DZ')}
                <span className="text-white/30 text-sm font-body ml-1">DZD</span>
              </p>
            </div>
          </div>

          {/* Statut modifiable */}
          <div className="pt-2 border-t border-white/8">
            <p className="font-label text-[0.6rem] uppercase tracking-[0.15rem] text-white/30 mb-3">
              Statut de la commande
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 text-sm font-label
                             uppercase tracking-[0.08rem] px-4 py-3 outline-none appearance-none
                             text-white focus:border-amber-400/40 transition-colors cursor-pointer"
                >
                  {['en attente','confirmé','en livraison','livré','retour','annulé'].map((s) => (
                    <option key={s} value={s} className="bg-[#1a1a1a] normal-case tracking-normal">
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
                                                   text-white/25 pointer-events-none" />
              </div>
              <button
                onClick={handleSaveStatus}
                disabled={saving || status === order.status}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-black font-label
                           text-[0.6875rem] uppercase tracking-[0.1rem] font-bold
                           transition-all disabled:opacity-30 disabled:cursor-not-allowed
                           flex items-center gap-2"
              >
                {saving && <Loader2 size={12} className="animate-spin" />}
                Sauvegarder
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────
function AdminOrdersPage() {
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatus]     = useState('Tous')
  const [sortField, setSortField]     = useState('createdAt')
  const [sortDir, setSortDir]         = useState('desc')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try   { const r = await api.get('/orders'); setOrders(r.data || []) }
    catch { toast.error('Erreur chargement commandes') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleUpdated = (updated) =>
    setOrders((prev) => prev.map((o) => o._id === updated._id ? updated : o))

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const filtered = orders
    .filter((o) => {
      const ms = statusFilter === 'Tous' || o.status === statusFilter
      const mq = !search ||
        `${o.customerInfo.firstName} ${o.customerInfo.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        o.customerInfo.phone.includes(search) ||
        o.customerInfo.wilaya.toLowerCase().includes(search.toLowerCase())
      return ms && mq
    })
    .sort((a, b) => {
      const va = sortField === 'total' ? a.total : new Date(a.createdAt)
      const vb = sortField === 'total' ? b.total : new Date(b.createdAt)
      return sortDir === 'asc' ? va - vb : vb - va
    })

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {})

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={11} className="opacity-20" />
    return sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="admin-label">Suivi</p>
          <h1 className="font-headline text-4xl text-white tracking-tight">Commandes</h1>
        </div>
        <p className="font-body text-white/25 text-sm">
          {filtered.length} / {orders.length} commande{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`flex items-center gap-2 px-4 py-2 border transition-all duration-200
                        font-label text-[0.6rem] uppercase tracking-[0.12rem]
                        ${statusFilter === s
                          ? 'bg-amber-400/15 border-amber-400/40 text-amber-400'
                          : 'bg-transparent border-white/8 text-white/30 hover:border-white/15 hover:text-white/50'}`}>
            {s !== 'Tous' && (
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
            )}
            {s === 'Tous' ? `Tous (${orders.length})` : `${STATUS_LABELS[s]} (${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, téléphone, wilaya…"
          className="admin-input pl-9 focus:border-amber-400/30 transition-colors" />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-amber-400/40" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card text-center py-20">
          <p className="font-headline text-5xl text-white/10 mb-3">VIDE</p>
          <p className="font-body text-white/25 text-sm">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {[
                  { label: 'Client',       field: null,        cls: '' },
                  { label: 'Localisation', field: null,        cls: 'hidden md:table-cell' },
                  { label: 'Articles',     field: null,        cls: 'hidden lg:table-cell' },
                  { label: 'Total',        field: 'total',     cls: 'text-right' },
                  { label: 'Date',         field: 'createdAt', cls: 'hidden sm:table-cell' },
                  { label: 'Statut',       field: null,        cls: '' },
                  { label: '',             field: null,        cls: 'w-10' },
                ].map(({ label, field, cls }) => (
                  <th key={label || 'action'}
                    onClick={field ? () => toggleSort(field) : undefined}
                    className={`px-4 py-3 admin-label text-left whitespace-nowrap
                                ${cls} ${field ? 'cursor-pointer hover:text-white/60 select-none' : ''}`}>
                    <span className="flex items-center gap-1">
                      {label} {field && <SortIcon field={field} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <AdminOrderRow
                  key={order._id}
                  order={order}
                  onUpdated={handleUpdated}
                  onViewDetail={() => setSelectedOrder(order)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal détail */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={(updated) => { handleUpdated(updated); setSelectedOrder(null) }}
        />
      )}
    </div>
  )
}

export default AdminOrdersPage