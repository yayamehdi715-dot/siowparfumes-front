import { useState, useEffect } from 'react'
import { Loader2, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
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

function AdminOrdersPage() {
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatus]     = useState('Tous')
  const [sortField, setSortField]     = useState('createdAt')
  const [sortDir, setSortDir]         = useState('desc')

  const fetch = async () => {
    setLoading(true)
    try   { const r = await api.get('/orders'); setOrders(r.data || []) }
    catch { toast.error('Erreur chargement commandes') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

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
                          ? 'bg-white/10 border-white/20 text-white'
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
          placeholder="Nom, téléphone, wilaya…" className="admin-input pl-9" />
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
          <Loader2 size={28} className="animate-spin text-white/20" />
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
                  { label: 'Client',      field: null,        cls: '' },
                  { label: 'Localisation',field: null,        cls: 'hidden md:table-cell' },
                  { label: 'Articles',    field: null,        cls: 'hidden lg:table-cell' },
                  { label: 'Total',       field: 'total',     cls: 'text-right' },
                  { label: 'Date',        field: 'createdAt', cls: 'hidden sm:table-cell' },
                  { label: 'Statut',      field: null,        cls: '' },
                ].map(({ label, field, cls }) => (
                  <th key={label}
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
                <AdminOrderRow key={order._id} order={order} onUpdated={handleUpdated} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage