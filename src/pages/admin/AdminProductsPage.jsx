// src/pages/admin/AdminProductsPage.jsx
// Gestion des produits admin : liste, création, modification, suppression

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, AlertTriangle, Loader2, Search } from 'lucide-react'
import api from '../../utils/api'
import AdminProductForm from '../../Components/admin/AdminProductForm'
import toast from 'react-hot-toast'

function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal états
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/products')
      setProducts(res.data || [])
    } catch {
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/products/${id}`)
      toast.success('Produit supprimé')
      setProducts((p) => p.filter((x) => x._id !== id))
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
      setDeleteConfirm(null)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const openCreate = () => { setEditingProduct(null); setShowForm(true) }
  const openEdit = (p) => { setEditingProduct(p); setShowForm(true) }

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="section-label">Catalogue</p>
          <h1 className="font-headline text-4xl text-brand-white tracking-wide">PRODUITS</h1>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={14} />
          Ajouter un produit
        </button>
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-500" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="input-field pl-9 text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Liste des produits */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-brand-gray-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="font-headline text-5xl text-brand-gray-800 mb-3">VIDE</p>
          <p className="text-brand-gray-500 font-body">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const totalStock = product.sizes?.reduce((s, x) => s + x.stock, 0) || 0
            return (
              <div key={product._id} className="admin-card group relative overflow-hidden">
                {/* Image */}
                <div className="h-40 -mx-6 -mt-6 mb-4 overflow-hidden bg-brand-gray-900">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-gray-700">
                      Pas d'image
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-gray-500 text-xs font-heading tracking-widest uppercase">
                      {product.brand}
                    </p>
                    <h3 className="font-heading font-bold text-brand-white text-sm truncate">
                      {product.name}
                    </h3>
                  </div>
                  <span className="tag flex-shrink-0 text-[9px]">{product.category}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="font-headline text-xl text-brand-white">
                    {(product.price ?? 0).toLocaleString('fr-DZ')}
                    <span className="text-xs text-brand-gray-500 font-body ml-1">DA</span>
                  </span>
                  <span className={`text-xs font-body ${totalStock === 0 ? 'text-red-400' : totalStock <= 5 ? 'text-yellow-400' : 'text-brand-gray-500'}`}>
                    {totalStock === 0 ? 'Épuisé' : `${totalStock} en stock`}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border
                               border-brand-gray-600 text-brand-gray-400 hover:border-brand-white
                               hover:text-brand-white transition-colors text-xs font-heading
                               font-semibold tracking-wider uppercase"
                  >
                    <Edit2 size={12} /> Modifier
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product)}
                    className="flex items-center justify-center gap-2 px-3 py-2 border
                               border-brand-gray-700 text-brand-gray-600 hover:border-brand-red
                               hover:text-brand-red transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal formulaire produit */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 pt-10">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => { setShowForm(false); setEditingProduct(null) }}
            />
            <div className="relative bg-brand-gray-900 border border-brand-gray-700
                            w-full max-w-2xl animate-slide-up">
              {/* Header modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-800">
                <h2 className="font-heading font-bold text-brand-white tracking-widest uppercase text-sm">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditingProduct(null) }}
                  className="p-2 text-brand-gray-500 hover:text-brand-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <AdminProductForm
                  initialData={editingProduct}
                  onSuccess={handleFormSuccess}
                  onCancel={() => { setShowForm(false); setEditingProduct(null) }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 max-w-sm w-full animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-brand-red" />
              <h3 className="font-heading font-bold text-brand-white">Supprimer le produit ?</h3>
            </div>
            <p className="text-brand-gray-400 font-body mb-1">
              <span className="text-brand-white font-semibold">{deleteConfirm.name}</span>
            </p>
            <p className="text-brand-gray-500 text-sm font-body mb-6">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deletingId === deleteConfirm._id}
                className="btn-primary flex items-center gap-2 flex-1 justify-center"
              >
                {deletingId === deleteConfirm._id && <Loader2 size={12} className="animate-spin" />}
                Supprimer
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage