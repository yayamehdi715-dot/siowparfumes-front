// src/components/admin/AdminProductForm.jsx
// Formulaire produit admin : création et modification avec tailles dynamiques et upload images

import { useState } from 'react'
import { Plus, Trash2, Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Bébé', 'Enfants', 'Femme', 'Homme', 'Lingerie', 'Accessoires']
const TAGS = ['Look bébé printemps', 'Look Femme Casual', 'Idées de cadeaux']

const EMPTY_PRODUCT = {
  name: '',
  brand: '',
  category: 'Homme',
  price: '',
  description: '',
  sizes: [{ size: '', stock: '' }],
  images: [],
  tags: [],
}

function AdminProductForm({ initialData, onSuccess, onCancel }) {
  const isEditing = !!initialData
  const [form, setForm] = useState(
    initialData
      ? {
          ...initialData,
          price: initialData.price.toString(),
          sizes: initialData.sizes?.length > 0
            ? initialData.sizes.map((s) => ({ size: s.size.toString(), stock: s.stock.toString() }))
            : [{ size: '', stock: '' }],
          images: initialData.images || [],
          tags: initialData.tags || [],
        }
      : EMPTY_PRODUCT
  )
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // ── Champs texte ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  // ── Gestion des tailles ───────────────────────────────────────────────────
  const addSize = () =>
    setForm((p) => ({ ...p, sizes: [...p.sizes, { size: '', stock: '' }] }))

  const removeSize = (i) =>
    setForm((p) => ({ ...p, sizes: p.sizes.filter((_, idx) => idx !== i) }))

  const updateSize = (i, field, value) =>
    setForm((p) => ({
      ...p,
      sizes: p.sizes.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    }))

  // ── Gestion des tags ──────────────────────────────────────────────────────
  const toggleTag = (tag) => {
    setForm((p) => ({
      ...p,
      tags: p.tags.includes(tag) 
        ? p.tags.filter(t => t !== tag)
        : [...p.tags, tag]
    }))
  }

  // ── Upload d'images ───────────────────────────────────────────────────────
  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((f) => formData.append('images', f))
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const urls = res.data.urls || res.data
      setForm((p) => ({ ...p, images: [...p.images, ...(Array.isArray(urls) ? urls : [urls])] }))
      toast.success(`${Array.isArray(urls) ? urls.length : 1} image(s) uploadée(s)`)
    } catch {
      toast.error("Erreur lors de l'upload des images")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (url) =>
    setForm((p) => ({ ...p, images: p.images.filter((i) => i !== url) }))

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nom requis'
    if (!form.brand.trim()) e.brand = 'Marque requise'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Prix invalide'
    if (form.images.length === 0 && !isEditing) e.images = 'Au moins une image requise'
    const sizesValid = form.sizes.every(
      (s) => s.size.toString().trim() !== '' && !isNaN(Number(s.stock)) && Number(s.stock) >= 0
    )
    if (!sizesValid) e.sizes = 'Toutes les pointures doivent avoir un stock valide'
    return e
  }

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        sizes: form.sizes
          .filter((s) => s.size.toString().trim() !== '')
          .map((s) => ({ size: s.size, stock: Number(s.stock) })),
      }
      if (isEditing) {
        await api.put(`/products/${initialData._id}`, payload)
        toast.success('Produit mis à jour')
      } else {
        await api.post('/products', payload)
        toast.success('Produit créé')
      }
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl p-8 shadow-lg" noValidate>
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-headline text-gray-900 mb-2">
          {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
        </h2>
        <p className="text-sm text-gray-500 font-body">
          Les champs marqués d'un * sont obligatoires
        </p>
      </div>

      {/* Infos de base */}
      <div className="space-y-6">
        <h3 className="text-lg font-headline text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 text-sm">1</span>
          Informations générales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Nom du produit *
            </label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Ex: Robe d'été fleurie..."
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                         font-body text-gray-900 placeholder:text-gray-500/50
                         ${errors.name 
                           ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' 
                           : 'border-gray-200 bg-white hover:border-green-400 focus:border-green-400 focus:ring-green-100'
                         } focus:outline-none focus:ring-4`}
            />
            {errors.name && <p className="text-red-600 text-xs mt-2 font-medium">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Marque *
            </label>
            <input
              name="brand" value={form.brand} onChange={handleChange}
              placeholder="Ex: Zara, H&M..."
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                         font-body text-gray-900 placeholder:text-gray-500/50
                         ${errors.brand 
                           ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' 
                           : 'border-gray-200 bg-white hover:border-green-400 focus:border-green-400 focus:ring-green-100'
                         } focus:outline-none focus:ring-4`}
            />
            {errors.brand && <p className="text-red-600 text-xs mt-2 font-medium">{errors.brand}</p>}
          </div>
          
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Catégorie *
            </label>
            <select
              name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white
                       hover:border-green-400 focus:border-green-400 focus:ring-4 focus:ring-green-100
                       font-body text-gray-900 transition-all duration-200 focus:outline-none
                       cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Prix (DA) *
            </label>
            <input
              name="price" value={form.price} onChange={handleChange}
              type="number" min="0" placeholder="Ex: 4500"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                         font-body text-gray-900 placeholder:text-gray-500/50
                         ${errors.price 
                           ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' 
                           : 'border-gray-200 bg-white hover:border-green-400 focus:border-green-400 focus:ring-green-100'
                         } focus:outline-none focus:ring-4`}
            />
            {errors.price && <p className="text-red-600 text-xs mt-2 font-medium">{errors.price}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-900 text-sm font-semibold mb-2">
            Description
          </label>
          <textarea
            name="description" value={form.description} onChange={handleChange}
            rows={4} placeholder="Décrivez le produit en quelques mots..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white
                     hover:border-green-400 focus:border-green-400 focus:ring-4 focus:ring-green-100
                     font-body text-gray-900 placeholder:text-gray-500/50
                     transition-all duration-200 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Tags section */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-headline text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-600-dark text-sm">2</span>
          Collections spéciales (optionnel)
        </h3>
        
        <p className="text-sm text-gray-500 font-body">
          Sélectionnez une ou plusieurs collections auxquelles ce produit appartient
        </p>
        
        <div className="flex flex-wrap gap-3">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-6 py-3 rounded-full font-body font-semibold text-sm
                         transition-all duration-200 border-2
                         ${form.tags.includes(tag)
                           ? 'bg-green-500 text-white border-green-400 shadow-md scale-105'
                           : 'bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600'
                         }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Tailles & stocks */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-headline text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm">3</span>
            Tailles & Stocks *
          </h3>
          <button 
            type="button" 
            onClick={addSize}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg
                     font-body font-semibold text-sm hover:bg-green-500-dark transition-colors"
          >
            <Plus size={16} /> Ajouter une taille
          </button>
        </div>
        
        <div className="space-y-3">
          {form.sizes.map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Taille</label>
                <input
                  value={s.size} 
                  onChange={(e) => updateSize(i, 'size', e.target.value)}
                  placeholder="Ex: 36, M, 6 mois..."
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white
                           hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-100
                           font-body text-gray-900 transition-all duration-200 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Stock</label>
                <input
                  type="number" min="0" value={s.stock}
                  onChange={(e) => updateSize(i, 'stock', e.target.value)}
                  placeholder="Quantité"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white
                           hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-100
                           font-body text-gray-900 transition-all duration-200 focus:outline-none"
                />
              </div>
              <button
                type="button" 
                onClick={() => removeSize(i)}
                className="mt-6 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 
                         rounded-lg transition-all duration-200"
                aria-label="Supprimer cette taille"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        {errors.sizes && <p className="text-red-600 text-sm mt-2 font-medium">{errors.sizes}</p>}
      </div>

      {/* Upload images */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-headline text-gray-900 flex items-center gap-2 mb-4">
          <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-sm">4</span>
          Images du produit {!isEditing && '*'}
        </h3>

        {/* Zone de drop */}
        <label
          className={`relative flex flex-col items-center justify-center gap-4 border-2 border-dashed
                     rounded-2xl p-12 cursor-pointer transition-all duration-300 group
                     ${dragOver
                       ? 'border-green-400 bg-green-50 scale-[1.02]'
                       : 'border-gray-300 hover:border-green-400 bg-gray-50 hover:bg-green-50/30'
                     }
                     ${errors.images ? 'border-red-300 bg-red-50' : ''}
                     ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            uploadFiles(e.dataTransfer.files)
          }}
        >
          <input
            type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
          
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all
                         ${dragOver ? 'bg-green-500 scale-110' : 'bg-gray-200 group-hover:bg-green-50'}`}>
            {uploading ? (
              <Loader2 size={32} className="text-green-600 animate-spin" />
            ) : (
              <Upload size={32} className={`transition-all ${dragOver ? 'text-white' : 'text-gray-400 group-hover:text-green-600'}`} />
            )}
          </div>
          
          <div className="text-center">
            <p className="text-gray-900 font-body font-semibold text-lg mb-1">
              {uploading ? 'Upload en cours...' : 'Glisser-déposer vos images ici'}
            </p>
            <p className="text-gray-500 text-sm">
              ou cliquez pour sélectionner · JPG, PNG, WebP
            </p>
          </div>
        </label>
        {errors.images && <p className="text-red-600 text-sm mt-2 font-medium">{errors.images}</p>}

        {/* Aperçu des images */}
        {form.images.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">
              {form.images.length} image{form.images.length > 1 ? 's' : ''} uploadée{form.images.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {form.images.map((url, i) => (
                <div key={i} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                  <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button" 
                    onClick={() => removeImage(url)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Supprimer l'image"
                  >
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <X size={20} className="text-white" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-8 border-t border-gray-200">
        <button 
          type="submit" 
          disabled={saving || uploading} 
          className="flex-1 sm:flex-none bg-green-500 text-white px-8 py-4 rounded-xl
                   font-body font-bold text-base hover:bg-green-500-dark
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
                   flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enregistrement...
            </>
          ) : (
            isEditing ? 'Mettre à jour le produit' : 'Créer le produit'
          )}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-500
                     font-body font-semibold hover:border-gray-300 hover:bg-gray-50
                     transition-all duration-200"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}

export default AdminProductForm