// src/pages/admin/AdminDashboardPage.jsx
// Dashboard admin — statistiques et résumé

import { useState, useEffect } from 'react'
import { TrendingUp, Package, RefreshCcw, ShoppingBag, AlertTriangle, Loader2 } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color = 'text-brand-white', accent }) {
  return (
    <div className={`admin-card relative overflow-hidden group ${accent ? 'border-brand-red/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-brand-gray-500 text-xs font-heading font-semibold tracking-widest uppercase mb-2">
            {label}
          </p>
          <p className={`font-headline text-4xl leading-none ${color}`}>
            {value ?? '—'}
          </p>
        </div>
        <div className={`w-10 h-10 flex items-center justify-center border ${
          accent ? 'border-brand-red/30 text-brand-red bg-brand-red/5' : 'border-brand-gray-700 text-brand-gray-600'
        }`}>
          <Icon size={18} />
        </div>
      </div>
      {/* Accent bar */}
      {accent && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red/50" />
      )}
    </div>
  )
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchStats()
  }, [])

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
    <div className="max-w-5xl mx-auto space-y-8">

      {/* En-tête */}
      <div className="flex items-end justify-between">
        <div>
          <p className="section-label">Vue d'ensemble</p>
          <h1 className="font-headline text-4xl text-brand-white tracking-wide">DASHBOARD</h1>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="btn-ghost flex items-center gap-2 text-xs"
        >
          <RefreshCcw size={12} />
          Réinitialiser les stats
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-card h-24 animate-pulse">
              <div className="h-3 bg-brand-gray-700 rounded w-2/3 mb-3" />
              <div className="h-8 bg-brand-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="Gains (livrés)"
            value={stats?.totalRevenue != null
              ? `${stats.totalRevenue.toLocaleString('fr-DZ')} DA`
              : '—'}
            color="text-emerald-400"
            accent
          />
          <StatCard
            icon={ShoppingBag}
            label="Total commandes"
            value={stats?.totalOrders}
          />
          <StatCard
            icon={Package}
            label="Livrées"
            value={stats?.deliveredOrders}
            color="text-emerald-400"
          />
          <StatCard
            icon={RefreshCcw}
            label="Retours"
            value={stats?.returnOrders}
            color="text-red-400"
          />
        </div>
      )}

      {/* Répartition statuts */}
      {stats && !loading && (
        <div className="admin-card">
          <p className="text-brand-gray-400 text-xs font-heading font-semibold tracking-widest uppercase mb-4">
            Répartition des commandes
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Confirmé', count: stats.confirmedOrders, color: 'bg-blue-400' },
              { label: 'En livraison', count: stats.inDeliveryOrders, color: 'bg-yellow-400' },
              { label: 'Livré', count: stats.deliveredOrders, color: 'bg-emerald-400' },
              { label: 'Retour', count: stats.returnOrders, color: 'bg-red-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <div className={`w-2 h-2 ${color} mx-auto mb-2`} />
                <p className="font-headline text-2xl text-brand-white">{count ?? 0}</p>
                <p className="text-brand-gray-500 text-xs font-heading tracking-wider uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal confirmation reset */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-brand-red" />
              <h3 className="font-heading font-bold text-brand-white tracking-wider">Confirmation</h3>
            </div>
            <p className="text-brand-gray-300 font-body mb-2">
              Cette action va supprimer toutes les commandes avec le statut{' '}
              <span className="text-emerald-400 font-semibold">livré</span> et{' '}
              <span className="text-red-400 font-semibold">retour</span>.
            </p>
            <p className="text-brand-gray-500 text-sm font-body mb-6">
              Cette opération est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="btn-primary flex items-center gap-2 flex-1 justify-center"
              >
                {resetting && <Loader2 size={14} className="animate-spin" />}
                Confirmer
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-ghost flex-1"
              >
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