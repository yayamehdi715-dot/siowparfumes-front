import { useState, useEffect } from 'react'
import { Loader2, Search, X, Trash2, CheckSquare, Square, Package,
         ChevronDown, AlertTriangle, RefreshCw } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// ─── Constantes ───────────────────────────────────────────────────────────────
const STATUS_FILTERS = ['Tous', 'en attente', 'confirmé', 'en livraison', 'livré', 'retour', 'annulé']
const STATUS_LABELS  = {
  'en attente':  'En attente',
  confirmé:      'Confirmé',
  'en livraison':'En livraison',
  livré:         'Livré',
  retour:        'Retour',
  annulé:        'Annulé',
}
const STATUS_STYLE = {
  'en attente':  { dot: 'bg-white/30',      badge: 'bg-white/8 text-white/50' },
  confirmé:      { dot: 'bg-blue-400',       badge: 'bg-blue-400/15 text-blue-400' },
  'en livraison':{ dot: 'bg-amber-400',      badge: 'bg-amber-400/15 text-amber-400' },
  livré:         { dot: 'bg-emerald-400',    badge: 'bg-emerald-400/15 text-emerald-400' },
  retour:        { dot: 'bg-orange-400',     badge: 'bg-orange-400/15 text-orange-400' },
  annulé:        { dot: 'bg-red-400',        badge: 'bg-red-400/15 text-red-400' },
}
const STATUS_OPTIONS = Object.keys(STATUS_LABELS)

// ─── Modal détail commande ────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onUpdated }) {
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)

  const date = new Date(order.createdAt).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const handleSave = async () => {
    if (status === order.status) return
    setSaving(true)
    try {
      await api.put(`/orders/${order._id}`, { status })
      toast.success('Statut mis à jour')
      onUpdated?.({ ...order, status })
      onClose()
    } catch { toast.error('Erreur mise à jour') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161616] border border-white/10 w-full max-w-xl animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <p className="font-label text-[0.55rem] uppercase tracking-[0.2rem] text-white/30">Commande</p>
            <p className="font-headline text-white text-lg tracking-tight">
              {order.customerInfo.firstName} {order.customerInfo.lastName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-white/25 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Infos client */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] border border-white/8 p-3">
              <p className="font-label text-[0.55rem] uppercase tracking-[0.15rem] text-amber-400/70 mb-2">Client</p>
              <p className="font-body text-white text-sm font-semibold">
                {order.customerInfo.firstName} {order.customerInfo.lastName}
              </p>
              <p className="font-body text-white/50 text-xs mt-1">{order.customerInfo.phone}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/8 p-3">
              <p className="font-label text-[0.55rem] uppercase tracking-[0.15rem] text-amber-400/70 mb-2">Livraison</p>
              <p className="font-body text-white text-sm font-semibold">{order.customerInfo.wilaya}</p>
              <p className="font-body text-white/50 text-xs mt-1">{order.customerInfo.commune}</p>
            </div>
          </div>

          {/* Articles */}
          <div>
            <p className="font-label text-[0.55rem] uppercase tracking-[0.15rem] text-white/30 mb-3">
              Articles ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3">
                  <div className="w-10 h-12 bg-white/5 flex-shrink-0 overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={14} className="text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-white/80 text-sm font-semibold truncate">{item.name}</p>
                    <p className="font-label text-[0.6rem] uppercase tracking-widest text-white/30 mt-0.5">
                      {item.size} · qté {item.quantity}
                    </p>
                  </div>
                  <p className="font-label text-[0.75rem] text-amber-400 font-semibold flex-shrink-0">
                    {((item.price ?? 0) * item.quantity).toLocaleString('fr-DZ')}
                    <span className="text-white/20 text-[0.6rem] ml-0.5">DZD</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total + date */}
          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <div>
              <p className="font-label text-[0.55rem] uppercase tracking-[0.15rem] text-white/25">Date</p>
              <p className="font-body text-white/40 text-xs mt-0.5">{date}</p>
            </div>
            <div className="text-right">
              <p className="font-label text-[0.55rem] uppercase tracking-[0.15rem] text-white/25">Total</p>
              <p className="font-headline text-amber-400 text-2xl font-bold mt-0.5">
                {(order.total ?? 0).toLocaleString('fr-DZ')}
                <span className="text-white/30 text-sm font-body ml-1">DZD</span>
              </p>
            </div>
          </div>

          {/* Statut */}
          <div className="pt-2 border-t border-white/8">
            <p className="font-label text-[0.55rem] uppercase tracking-[0.15rem] text-white/30 mb-3">Statut</p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 text-sm font-label
                             uppercase tracking-[0.08rem] px-4 py-3 outline-none appearance-none
                             text-white focus:border-amber-400/40 transition-colors cursor-pointer">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-[#1a1a1a] normal-case tracking-normal">
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
                                                   text-white/25 pointer-events-none" />
              </div>
              <button onClick={handleSave} disabled={saving || status === order.status}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-black font-label
                           text-[0.6875rem] uppercase tracking-[0.1rem] font-bold
                           transition-all disabled:opacity-30 disabled:cursor-not-allowed
                           flex items-center gap-2">
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

// ─── Carte commande (mobile + desktop) ───────────────────────────────────────
function OrderCard({ order, selected, onSelect, onViewDetail, onUpdated, selectionMode }) {
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)
  const style = STATUS_STYLE[status] || STATUS_STYLE['en attente']

  const date = new Date(order.createdAt).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  })
  const time = new Date(order.createdAt).toLocaleTimeString('fr-DZ', {
    hour: '2-digit', minute: '2-digit',
  })

  const handleStatusSave = async (e) => {
    e.stopPropagation()
    if (status === order.status) return
    setSaving(true)
    try {
      await api.put(`/orders/${order._id}`, { status })
      toast.success('Statut mis à jour')
      onUpdated?.({ ...order, status })
    } catch { toast.error('Erreur'); setStatus(order.status) }
    finally { setSaving(false) }
  }

  return (
    <div
      onClick={() => selectionMode ? onSelect(order._id) : onViewDetail(order)}
      className={`relative bg-[#161616] border transition-all duration-200 cursor-pointer
                  ${selected
                    ? 'border-amber-400/50 bg-amber-400/5'
                    : 'border-white/8 hover:border-white/20 hover:bg-white/[0.02]'}`}
    >
      {/* Checkbox de sélection */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(order._id) }}
        className="absolute top-3 right-3 text-white/30 hover:text-amber-400 transition-colors z-10"
      >
        {selected
          ? <CheckSquare size={16} className="text-amber-400" />
          : <Square size={16} />
        }
      </button>

      <div className="p-4">
        {/* Ligne 1 : nom + total */}
        <div className="flex items-start justify-between gap-2 pr-6">
          <div>
            <p className="font-body font-bold text-white text-sm">
              {order.customerInfo.firstName} {order.customerInfo.lastName}
            </p>
            <p className="font-body text-white/40 text-xs mt-0.5">{order.customerInfo.phone}</p>
          </div>
          <p className="font-headline text-amber-400 text-lg font-bold flex-shrink-0">
            {(order.total ?? 0).toLocaleString('fr-DZ')}
            <span className="text-white/25 text-xs font-body ml-0.5">DZD</span>
          </p>
        </div>

        {/* Ligne 2 : wilaya + date */}
        <div className="flex items-center justify-between mt-2">
          <p className="font-body text-white/50 text-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-white/25"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>location_on</span>
            {order.customerInfo.wilaya} · {order.customerInfo.commune}
          </p>
          <p className="font-body text-white/25 text-xs">{date} {time}</p>
        </div>

        {/* Ligne 3 : articles résumé */}
        <p className="font-body text-white/30 text-xs mt-2 truncate">
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(' · ')}
        </p>

        {/* Ligne 4 : badge statut + sélecteur statut inline */}
        <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
          <div className="relative flex-1">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full text-[0.6rem] font-label uppercase tracking-[0.08rem]
                          bg-transparent border border-white/10 pl-2 pr-6 py-1.5
                          outline-none appearance-none cursor-pointer
                          focus:border-amber-400/30 transition-colors ${style.badge}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#1a1a1a] text-white normal-case tracking-normal">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2
                                               text-white/20 pointer-events-none" />
          </div>
          {status !== order.status && (
            <button onClick={handleStatusSave} disabled={saving}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-label
                         text-[0.6rem] uppercase tracking-[0.08rem] font-bold transition-all
                         flex items-center gap-1 flex-shrink-0">
              {saving ? <Loader2 size={10} className="animate-spin" /> : '✓'}
              {saving ? '' : 'OK'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
function AdminOrdersPage() {
  const [orders, setOrders]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatus]       = useState('Tous')
  const [selectedIds, setSelectedIds]   = useState(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [deletingIds, setDeletingIds]   = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try { const r = await api.get('/orders'); setOrders(r.data || []) }
    catch { toast.error('Erreur chargement commandes') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleUpdated = (updated) =>
    setOrders((prev) => prev.map((o) => o._id === updated._id ? updated : o))

  const filtered = orders
    .filter((o) => {
      const ms = statusFilter === 'Tous' || o.status === statusFilter
      const mq = !search ||
        `${o.customerInfo.firstName} ${o.customerInfo.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        o.customerInfo.phone.includes(search) ||
        o.customerInfo.wilaya.toLowerCase().includes(search.toLowerCase())
      return ms && mq
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {})

  // ── Sélection ────────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((o) => o._id)))
    }
  }

  const toggleSelectionMode = () => {
    setSelectionMode((s) => !s)
    setSelectedIds(new Set())
  }

  // ── Suppression ──────────────────────────────────────────────────────────────
  const handleDeleteSelected = async () => {
    setDeletingIds(true)
    try {
      const ids = Array.from(selectedIds)
      await api.delete('/orders', { data: { ids } })
      setOrders((prev) => prev.filter((o) => !selectedIds.has(o._id)))
      toast.success(`${ids.length} commande(s) supprimée(s)`)
      setSelectedIds(new Set())
      setSelectionMode(false)
      setShowDeleteConfirm(false)
    } catch { toast.error('Erreur lors de la suppression') }
    finally { setDeletingIds(false) }
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="admin-label">Suivi</p>
          <h1 className="font-headline text-3xl lg:text-4xl text-white tracking-tight">Commandes</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchOrders}
            className="admin-btn-ghost flex items-center gap-2 text-xs">
            <RefreshCw size={11} /> Actualiser
          </button>
          <button
            onClick={toggleSelectionMode}
            className={`flex items-center gap-2 px-3 py-2 border transition-all font-label
                        text-[0.6rem] uppercase tracking-[0.12rem]
                        ${selectionMode
                          ? 'border-amber-400/40 text-amber-400 bg-amber-400/8'
                          : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
            <CheckSquare size={12} />
            {selectionMode ? 'Annuler sélection' : 'Sélectionner'}
          </button>
          {selectionMode && selectedIds.size > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 border border-red-400/30
                         text-red-400 bg-red-400/8 hover:bg-red-400/15 transition-all
                         font-label text-[0.6rem] uppercase tracking-[0.12rem]">
              <Trash2 size={12} />
              Supprimer ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* ── Filtres statut ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all duration-200
                        font-label text-[0.6rem] uppercase tracking-[0.1rem]
                        ${statusFilter === s
                          ? 'bg-amber-400/15 border-amber-400/40 text-amber-400'
                          : 'bg-transparent border-white/8 text-white/30 hover:border-white/15 hover:text-white/50'}`}>
            {s !== 'Tous' && <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[s]?.dot}`} />}
            {s === 'Tous' ? `Tous (${orders.length})` : `${STATUS_LABELS[s]} (${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {/* ── Search + sélectionner tout ─────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, téléphone, wilaya…"
            className="admin-input pl-9 focus:border-amber-400/30 transition-colors w-full" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>

        {selectionMode && filtered.length > 0 && (
          <button onClick={selectAll}
            className="flex items-center gap-2 font-label text-[0.6rem] uppercase tracking-[0.1rem]
                       text-white/40 hover:text-amber-400 transition-colors">
            {allSelected ? <CheckSquare size={13} className="text-amber-400" /> : <Square size={13} />}
            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        )}

        <p className="font-body text-white/20 text-xs ml-auto">
          {filtered.length} / {orders.length}
        </p>
      </div>

      {/* ── Grille commandes ───────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-amber-400/30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#161616] border border-white/8 text-center py-20">
          <p className="font-headline text-5xl text-white/10 mb-3">VIDE</p>
          <p className="font-body text-white/25 text-sm">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              selected={selectedIds.has(order._id)}
              onSelect={toggleSelect}
              onViewDetail={setSelectedOrder}
              onUpdated={handleUpdated}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      )}

      {/* ── Modal détail commande ──────────────────────────────── */}
      {selectedOrder && !selectionMode && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={(updated) => { handleUpdated(updated); setSelectedOrder(null) }}
        />
      )}

      {/* ── Confirm suppression ────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#161616] border border-white/8 p-8 max-w-sm w-full animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={17} className="text-red-400 flex-shrink-0" />
              <h3 className="font-headline text-white text-lg">Confirmer la suppression ?</h3>
            </div>
            <p className="font-body text-white/40 text-sm mb-1">
              <span className="text-white font-semibold">{selectedIds.size} commande(s)</span> seront
              définitivement supprimées.
            </p>
            <p className="font-body text-white/25 text-xs mb-8">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteSelected} disabled={deletingIds}
                className="admin-btn-danger flex-1 justify-center">
                {deletingIds && <Loader2 size={12} className="animate-spin" />}
                Supprimer
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="admin-btn-ghost flex-1">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage