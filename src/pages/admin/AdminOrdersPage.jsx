// src/pages/admin/AdminOrdersPage.jsx
// Gestion des commandes admin avec filtres par statut

import { useState, useEffect } from 'react'
import { Loader2, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import api from '../../utils/api'
import AdminOrderRow from '../../Components/admin/AdminOrderRow'
import toast from 'react-hot-toast'

const STATUS_FILTERS = ['Tous', 'en attente', 'confirmé', 'en livraison', 'livré', 'retour', 'annulé']

const STATUS_LABELS = {
  'en attente': 'En attente',
  confirmé: 'Confirmé',
  'en livraison': 'En livraison',
  livré: 'Livré',
  retour: 'Retour',
  annulé: 'Annulé',
}

const STATUS_COLORS = {
  'en attente': 'text-gray-400',
  confirmé: 'text-blue-400',
  'en livraison': 'text-yellow-400',
  livré: 'text-emerald-400',
  retour: 'text-orange-400',
  annulé: 'text-red-400',
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders')
      setOrders(res.data || [])
    } catch {
      toast.error('Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleUpdated = (updated) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)))
  }

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('desc') }
  }

  // Filtrage + tri
  const filtered = orders
    .filter((o) => {
      const matchStatus = statusFilter === 'Tous' || o.status === statusFilter
      const matchSearch =
        !search ||
        `${o.customerInfo.firstName} ${o.customerInfo.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        o.customerInfo.phone.includes(search) ||
        o.customerInfo.wilaya.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
    .sort((a, b) => {
      let va, vb
      if (sortField === 'total') { va = a.total; vb = b.total }
      else { va = new Date(a.createdAt); vb = new Date(b.createdAt) }
      return sortDir === 'asc' ? va - vb : vb - va
    })

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  // Compteurs par statut
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="section-label">Suivi</p>
          <h1 className="font-headline text-4xl text-brand-white tracking-wide">COMMANDES</h1>
        </div>
        <p className="text-brand-gray-500 font-body text-sm">
          {filtered.length} / {orders.length} commande{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-xs font-heading font-bold tracking-widest uppercase
                         transition-all duration-200 border flex items-center gap-2
                         ${statusFilter === s
                           ? 'bg-brand-red border-brand-red text-white'
                           : 'bg-transparent border-brand-gray-700 text-brand-gray-400 hover:border-brand-gray-400'
                         }`}
          >
            {s === 'Tous' ? `Tous (${orders.length})` : (
              <>
                <span className={s !== statusFilter ? STATUS_COLORS[s] : ''}>
                  {STATUS_LABELS[s]}
                </span>
                <span className="opacity-60">({counts[s] || 0})</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-500" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, téléphone, wilaya..."
          className="input-field pl-9 text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-brand-gray-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="font-headline text-5xl text-brand-gray-800 mb-3">VIDE</p>
          <p className="text-brand-gray-500 font-body">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-gray-700">
                <th className="text-left px-4 py-3 text-brand-gray-500 text-xs font-heading
                               font-bold tracking-widest uppercase">
                  Client
                </th>
                <th className="text-left px-4 py-3 text-brand-gray-500 text-xs font-heading
                               font-bold tracking-widest uppercase hidden md:table-cell">
                  Localisation
                </th>
                <th className="text-left px-4 py-3 text-brand-gray-500 text-xs font-heading
                               font-bold tracking-widest uppercase hidden lg:table-cell">
                  Articles
                </th>
                <th
                  className="text-right px-4 py-3 text-brand-gray-500 text-xs font-heading
                             font-bold tracking-widest uppercase cursor-pointer hover:text-brand-white
                             transition-colors select-none"
                  onClick={() => toggleSort('total')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Total <SortIcon field="total" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-brand-gray-500 text-xs font-heading
                             font-bold tracking-widest uppercase cursor-pointer hover:text-brand-white
                             transition-colors hidden sm:table-cell select-none"
                  onClick={() => toggleSort('createdAt')}
                >
                  <span className="flex items-center gap-1">
                    Date <SortIcon field="createdAt" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-brand-gray-500 text-xs font-heading
                               font-bold tracking-widest uppercase">
                  Statut
                </th>
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