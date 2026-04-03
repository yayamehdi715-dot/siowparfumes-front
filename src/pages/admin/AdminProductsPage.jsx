import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, AlertTriangle, Loader2, Search } from 'lucide-react'
import api from '../../utils/api'
import AdminProductForm from '../../Components/admin/AdminProductForm'
import toast from 'react-hot-toast'

const PARFUM_CATS = ['Parfums', 'Parfums Saoudiens']

function AdminProductsPage() {
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [showForm, setShowForm]       = useState(false)
  const [editingProduct, setEditing]  = useState(null)
  const [deletingId, setDeletingId]   = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try   { const res = await api.get('/products'); setProducts(res.data || []) }
    catch { toast.error('Erreur chargement produits') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/products/${id}`)
      toast.success('Produit supprimé')
      setProducts((p) => p.filter((x) => x._id !== id))
    } catch { toast.error('Erreur suppression') }
    finally { setDeletingId(null); setDeleteConfirm(null) }
  }

  const handleFormSuccess = () => { setShowForm(false); setEditing(null); fetchProducts() }
  const openCreate = () => { setEditing(null); setShowForm(true) }
  const openEdit   = (p) => { setEditing(p); setShowForm(true) }

  const filtered = products.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="admin-label">Catalogue</p>
          <h1 className="font-headline text-4xl text-white tracking-tight">Produits</h1>
        </div>
        <button onClick={openCreate} className="admin-btn-primary flex items-center gap-2">
          <Plus size={13} /> Ajouter un produit
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="admin-input pl-9" />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-amber-400/30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card text-center py-20">
          <p className="font-headline text-5xl text-white/10 mb-3">VIDE</p>
          <p className="font-body text-white/25 text-sm">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const isParfum = PARFUM_CATS.includes(product.category)

            // Pour parfums : afficher les volumes
            const volumes = isParfum
              ? product.extraits?.map((e) => `${e.ml}ml`).join(' · ') || 'Flacon'
              : null

            // Pour montres/essentiels : afficher les tailles
            const tailles = !isParfum
              ? product.sizes?.map((s) => s.size).join(' · ') || null
              : null

            return (
              <div key={product._id} className="admin-card group relative overflow-hidden">
                {/* Image */}
                <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-white/5 relative">
                  {product.images?.[0]
                    ? <img src={product.images[0]} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/10 text-4xl"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}>image</span>
                      </div>
                  }
                  {/* Ligne dorée en bas de l'image */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px]
                                  bg-gradient-to-r from-amber-400/0 via-amber-400/50 to-amber-400/0
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="font-label text-[0.6rem] uppercase tracking-[0.1rem]
                                   px-2 py-1 bg-white/8 text-white/50">
                    {product.category}
                  </span>
                  {product.bestSeller && (
                    <span className="font-label text-[0.6rem] uppercase tracking-[0.1rem]
                                     px-2 py-1 bg-amber-400/15 text-amber-400">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="mb-3">
                  {product.brand && (
                    <p className="font-label text-[0.6rem] uppercase tracking-[0.15rem] text-white/30 mb-0.5">
                      {product.brand}
                    </p>
                  )}
                  <h3 className="font-headline text-white text-base leading-tight truncate">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mb-4 gap-2">
                  {/* Prix */}
                  <span className="font-headline text-xl text-amber-400 font-bold">
                    {(product.price ?? 0).toLocaleString('fr-DZ')}
                    <span className="text-xs text-white/30 font-body ml-1">DZD</span>
                  </span>

                  {/* Tailles ou volumes — remplace le badge "Épuisé" */}
                  {(volumes || tailles) && (
                    <span className="font-label text-[0.6rem] text-white/30 truncate max-w-[120px]"
                          title={volumes || tailles}>
                      {volumes || tailles}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                               border border-white/10 text-white/40 hover:border-amber-400/30
                               hover:text-amber-400 transition-colors
                               font-label text-[0.6rem] uppercase tracking-[0.1rem]">
                    <Edit2 size={11} /> Modifier
                  </button>
                  <button onClick={() => setDeleteConfirm(product)}
                    className="flex items-center justify-center px-3 py-2.5
                               border border-white/8 text-white/20 hover:border-red-400/30
                               hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 pt-10">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={() => { setShowForm(false); setEditing(null) }} />
            <div className="relative bg-[#161616] border border-white/8 w-full max-w-2xl animate-fade-up">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                <p className="admin-label">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </p>
                <button onClick={() => { setShowForm(false); setEditing(null) }}
                  className="p-2 text-white/25 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6">
                <AdminProductForm initialData={editingProduct} onSuccess={handleFormSuccess}
                  onCancel={() => { setShowForm(false); setEditing(null) }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#161616] border border-white/8 p-8 max-w-sm w-full animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={17} className="text-red-400 flex-shrink-0" />
              <h3 className="font-headline text-white text-lg">Supprimer ce produit ?</h3>
            </div>
            <p className="font-body text-white/40 text-sm mb-1">
              <span className="text-white">{deleteConfirm.name}</span> sera définitivement supprimé.
            </p>
            <p className="font-body text-white/25 text-xs mb-8">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deletingId === deleteConfirm._id}
                className="admin-btn-danger flex-1 justify-center">
                {deletingId === deleteConfirm._id && <Loader2 size={12} className="animate-spin" />}
                Supprimer
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="admin-btn-ghost flex-1">
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