import { useState, useEffect } from 'react'
import { TrendingUp, Package, RotateCcw, ShoppingBag, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  confirmé:      'bg-blue-500/20 text-blue-400',
  'en livraison':'bg-amber-500/20 text-amber-400',
  livré:         'bg-emerald-500/20 text-emerald-400',
  retour:        'bg-orange-500/20 text-orange-400',
}

function StatCard({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className={`admin-card relative overflow-hidden min-w-0
      ${highlight ? 'border-[#8C495F]/40' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="admin-label truncate">{label}</p>
          <p className="font-headline text-2xl lg:text-3xl text-white mt-1 tracking-tight break-all">
            {value ?? '—'}
          </p>
        </div>
        <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0
          ${highlight ? 'bg-[#8C495F]/20 text-[#8C495F]' : 'bg-white/5 text-white/30'}`}>
          <Icon size={16} />
        </div>
      </div>
      {highlight && <div className="absolute bottom-0 left-0 right-0 h-px bg-[#8C495F]/50" />}
    </div>
  )
}

function AdminDashboardPage() {
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [resetting, setResetting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } catch {
      toast.error('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  const handleReset = async () => {
    setResetting(true)
    try {
      await api.post('/admin/stats/reset')
      toast.success('Statistiques réinitialisées')
      setShowConfirm(false)
      await fetchStats()
    } catch {
      toast.error('Erreur lors de la réinitialisation')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="admin-label">Vue d'ensemble</p>
          <h1 className="font-headline text-3xl lg:text-4xl text-white tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchStats} className="admin-btn-ghost flex items-center gap-2">
            <RefreshCw size={12} /> Actualiser
          </button>
          <button onClick={() => setShowConfirm(true)}
            className="admin-btn-ghost flex items-center gap-2 text-red-400/60 hover:text-red-400
                       border-red-400/10 hover:border-red-400/30">
            <RotateCcw size={12} /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-card h-24 animate-pulse">
              <div className="h-2.5 bg-white/8 w-2/3 mb-3" />
              <div className="h-8 bg-white/8 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard icon={TrendingUp} label="Chiffre d'affaires"
            value={stats?.totalRevenue != null
              ? `${stats.totalRevenue.toLocaleString('fr-DZ')} DZD` : '—'}
            highlight />
          <StatCard icon={ShoppingBag} label="Total commandes"  value={stats?.totalOrders} />
          <StatCard icon={Package}     label="Livrées"          value={stats?.deliveredOrders} />
          <StatCard icon={RotateCcw}   label="Retours"          value={stats?.returnOrders} />
        </div>
      )}

      {/* Status breakdown */}
      {stats && !loading && (
        <div className="admin-card overflow-x-auto">
          <p className="admin-label mb-6">Répartition des commandes</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 min-w-0">
            {[
              { label: 'Confirmé',    count: stats.confirmedOrders,  key: 'confirmé' },
              { label: 'En livraison',count: stats.inDeliveryOrders, key: 'en livraison' },
              { label: 'Livré',       count: stats.deliveredOrders,  key: 'livré' },
              { label: 'Retour',      count: stats.returnOrders,     key: 'retour' },
            ].map(({ label, count, key }) => (
              <div key={key} className="text-center min-w-0">
                <span className={`inline-block px-2 py-1 font-label text-[0.6rem]
                                  uppercase tracking-[0.1rem] mb-3 ${STATUS_COLORS[key]}`}>
                  {label}
                </span>
                <p className="font-headline text-2xl lg:text-3xl text-white">{count ?? 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {stats?.byCategory && !loading && (
        <div className="admin-card">
          <p className="admin-label mb-6">Ventes par catégorie</p>
          <div className="space-y-3">
            {Object.entries(stats.byCategory).map(([cat, data]) => {
              const pct = stats.totalRevenue > 0
                ? Math.round((data.revenue / stats.totalRevenue) * 100) : 0
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1.5 gap-2 flex-wrap">
                    <span className="font-label text-[0.6875rem] uppercase tracking-[0.1rem] text-white/60 truncate">
                      {cat}
                    </span>
                    <span className="font-label text-[0.6875rem] text-white/40 flex-shrink-0">
                      {data.orders} cmd · {data.revenue.toLocaleString('fr-DZ')} DZD
                    </span>
                  </div>
                  <div className="h-1 bg-white/8 w-full">
                    <div className="h-1 bg-[#8C495F]/70 transition-all duration-700"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161616] border border-white/8 p-8 max-w-sm w-full animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
              <h3 className="font-headline text-white text-lg">Confirmer la réinitialisation ?</h3>
            </div>
            <p className="font-body text-white/50 text-sm leading-relaxed mb-2">
              Toutes les commandes <span className="text-emerald-400">livrées</span> et{' '}
              <span className="text-orange-400">retournées</span> seront supprimées.
            </p>
            <p className="font-body text-white/30 text-xs mb-8">Cette opération est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={handleReset} disabled={resetting}
                className="admin-btn-danger flex-1 justify-center">
                {resetting && <Loader2 size={12} className="animate-spin" />}
                Confirmer
              </button>
              <button onClick={() => setShowConfirm(false)} className="admin-btn-ghost flex-1">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage