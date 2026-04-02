import { useState } from 'react'
import { Plus, Trash2, Upload, X, Loader2 } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const CATEGORIES  = ['Montres', 'Parfums', 'Parfums Saoudiens', 'Essentiels']
const PARFUM_CATS = ['Parfums', 'Parfums Saoudiens']

const EMPTY = {
  name: '', brand: '', category: 'Montres', price: '',
  description: '',
  sizes:    [{ size: '' }],
  extraits: [],
  images: [], tags: [], bestSeller: false,
}

// FieldSet HORS du composant → évite le re-mount à chaque frappe
function FieldSet({ label, error, children }) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {children}
      {error && <p className="text-red-400/80 text-xs mt-1.5">{error}</p>}
    </div>
  )
}

function AdminProductForm({ initialData, onSuccess, onCancel }) {
  const isEditing = !!initialData
  const [form, setForm] = useState(
    initialData ? {
      ...initialData,
      price:    initialData.price?.toString() ?? '',
      sizes:    initialData.sizes?.length > 0
        ? initialData.sizes.map((s) => ({ size: s.size.toString() }))
        : [{ size: '' }],
      extraits: initialData.extraits?.length > 0
        ? initialData.extraits.map((e) => ({ ml: e.ml.toString(), price: e.price.toString() }))
        : [],
      images:     initialData.images     || [],
      tags:       initialData.tags       || [],
      bestSeller: initialData.bestSeller || false,
    } : EMPTY
  )
  const [errors, setErrors]       = useState({})
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [dragOver, setDragOver]   = useState(false)

  const isParfum = PARFUM_CATS.includes(form.category)

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }))
    setErrors((p) => ({ ...p, [key]: '' }))
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  const handleCategoryChange = (e) => {
    const cat = e.target.value
    setForm((p) => ({
      ...p,
      category: cat,
      sizes:    PARFUM_CATS.includes(cat) ? [] : (p.sizes.length ? p.sizes : [{ size: '' }]),
      extraits: PARFUM_CATS.includes(cat) ? p.extraits : [],
    }))
    setErrors({})
  }

  // Tailles (Montres / Essentiels) — sans stock
  const addSize    = () => setForm((p) => ({ ...p, sizes: [...p.sizes, { size: '' }] }))
  const removeSize = (i) => setForm((p) => ({ ...p, sizes: p.sizes.filter((_, idx) => idx !== i) }))
  const updateSize = (i, val) =>
    setForm((p) => ({ ...p, sizes: p.sizes.map((s, idx) => idx === i ? { size: val } : s) }))

  // Extraits (Parfums) — ml + price, sans stock
  const addExtrait    = () => setForm((p) => ({ ...p, extraits: [...p.extraits, { ml: '', price: '' }] }))
  const removeExtrait = (i) => setForm((p) => ({ ...p, extraits: p.extraits.filter((_, idx) => idx !== i) }))
  const updateExtrait = (i, field, val) =>
    setForm((p) => ({ ...p, extraits: p.extraits.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }))

  const uploadFiles = async (files) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      Array.from(files).forEach((f) => fd.append('images', f))
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const urls = res.data.urls || res.data
      setForm((p) => ({ ...p, images: [...p.images, ...(Array.isArray(urls) ? urls : [urls])] }))
      toast.success(`${Array.isArray(urls) ? urls.length : 1} image(s) uploadée(s)`)
    } catch { toast.error("Erreur lors de l'upload") }
    finally { setUploading(false) }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nom requis'
    if (!form.price || isNaN(+form.price) || +form.price <= 0) e.price = 'Prix invalide'
    if (!isEditing && form.images.length === 0) e.images = 'Au moins une image requise'
    if (!isParfum) {
      if (form.sizes.length === 0) e.sizes = 'Ajoutez au moins une taille'
      const ok = form.sizes.every((s) => s.size.toString().trim())
      if (!ok) e.sizes = 'Toutes les tailles doivent avoir un nom'
    } else if (form.extraits.length > 0) {
      const ok = form.extraits.every(
        (ex) => ex.ml.toString().trim() && !isNaN(+ex.ml) && +ex.ml > 0
               && !isNaN(+ex.price) && +ex.price >= 0
      )
      if (!ok) e.extraits = 'Tous les volumes doivent avoir une quantité (ml) et un prix valides'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: +form.price,
        ...(isParfum
          ? {
              flaconStock: 0,
              extraits: form.extraits.map((ex) => ({ ml: +ex.ml, price: +ex.price, stock: 0 })),
              sizes: [],
            }
          : {
              sizes: form.sizes
                .filter((s) => s.size.toString().trim())
                .map((s) => ({ size: s.size, stock: 0 })),
              flaconStock: 0,
              extraits: [],
            }
        ),
      }
      if (isEditing) await api.put(`/products/${initialData._id}`, payload)
      else           await api.post('/products', payload)
      toast.success(isEditing ? 'Produit mis à jour' : 'Produit créé')
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>

      {/* ── 1. Catégorie ──────────────────────────────────────── */}
      <div>
        <p className="admin-label mb-4 text-white/60">Catégorie *</p>
        <div className="relative">
          <select name="category" value={form.category} onChange={handleCategoryChange}
            className="admin-select pr-8 w-full">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2
                           text-white/25 text-[16px] pointer-events-none"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>expand_more</span>
        </div>
      </div>

      {/* ── 2. Infos générales ────────────────────────────────── */}
      <div>
        <p className="admin-label mb-4 text-white/60">Informations générales</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <FieldSet label="Nom du produit *" error={errors.name}>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Ex: Oud Royal..." className="admin-input" autoComplete="off" />
          </FieldSet>

          <FieldSet label="Marque">
            <input name="brand" value={form.brand} onChange={handleChange}
              placeholder="Ex: Amouage..." className="admin-input" autoComplete="off" />
          </FieldSet>

          <FieldSet label="Prix (DZD) *" error={errors.price}>
            <input name="price" value={form.price} onChange={handleChange}
              type="number" min="0" placeholder="Ex: 4500" className="admin-input" />
          </FieldSet>

        </div>
        <div className="mt-4">
          <FieldSet label="Description">
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Décrivez le produit..." className="admin-input resize-none" />
          </FieldSet>
        </div>
      </div>

      {/* ── 3a. Tailles (Montres / Essentiels) — sans stock ───── */}
      {!isParfum && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="admin-label text-white/60">Tailles *</p>
            <button type="button" onClick={addSize}
              className="flex items-center gap-1.5 text-white/40 hover:text-white
                         font-label text-[0.6875rem] uppercase tracking-[0.1rem] transition-colors">
              <Plus size={12} /> Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {form.sizes.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  value={s.size}
                  onChange={(e) => updateSize(i, e.target.value)}
                  placeholder="Taille (ex: M, 44, XL…)"
                  className="admin-input flex-1"
                  autoComplete="off"
                />
                <button type="button" onClick={() => removeSize(i)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {errors.sizes && <p className="text-red-400/80 text-xs mt-2">{errors.sizes}</p>}
        </div>
      )}

      {/* ── 3b. Volumes (Parfums / Parfums Saoudiens) ─────────── */}
      {isParfum && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="admin-label text-white/60">Volumes disponibles</p>
              <p className="text-white/30 text-xs mt-1 font-body">
                Ajoutez les volumes à la vente avec leur prix (ex: 20ml, 30ml…)
              </p>
            </div>
            <button type="button" onClick={addExtrait}
              className="flex items-center gap-1.5 text-white/40 hover:text-white
                         font-label text-[0.6875rem] uppercase tracking-[0.1rem] transition-colors">
              <Plus size={12} /> Ajouter un volume
            </button>
          </div>

          {form.extraits.length > 0 && (
            <div className="flex gap-3 mb-1 mt-3">
              <span className="text-white/25 text-[0.6rem] font-label uppercase tracking-widest flex-1">Quantité (ml)</span>
              <span className="text-white/25 text-[0.6rem] font-label uppercase tracking-widest flex-1">Prix (DZD)</span>
              <span className="w-10" />
            </div>
          )}

          <div className="space-y-2">
            {form.extraits.map((ex, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  value={ex.ml}
                  onChange={(e) => updateExtrait(i, 'ml', e.target.value)}
                  placeholder="Ex: 20"
                  className="admin-input flex-1"
                  autoComplete="off"
                  inputMode="numeric"
                />
                <input
                  type="number" min="0"
                  value={ex.price}
                  onChange={(e) => updateExtrait(i, 'price', e.target.value)}
                  placeholder="Ex: 800"
                  className="admin-input flex-1"
                />
                <button type="button" onClick={() => removeExtrait(i)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {form.extraits.length === 0 && (
            <div className="border border-dashed border-white/8 p-5 text-center mt-2">
              <p className="text-white/20 font-label text-[0.6875rem] uppercase tracking-[0.1rem]">
                Aucun volume — cliquez sur "Ajouter un volume"
              </p>
            </div>
          )}
          {errors.extraits && <p className="text-red-400/80 text-xs mt-2">{errors.extraits}</p>}
        </div>
      )}

      {/* ── 4. Images ─────────────────────────────────────────── */}
      <div>
        <p className="admin-label mb-4 text-white/60">Images {!isEditing && '*'}</p>
        <label
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed
                       p-10 cursor-pointer transition-all duration-200
                       ${dragOver ? 'border-[#8C495F]/60 bg-[#8C495F]/8'
                                  : 'border-white/10 hover:border-white/25 bg-white/[0.02]'}
                       ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}>
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => uploadFiles(e.target.files)} />
          {uploading
            ? <Loader2 size={24} className="text-[#8C495F] animate-spin" />
            : <Upload size={22} className="text-white/25" />}
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.15rem] text-white/30">
            {uploading ? 'Upload en cours…' : 'Glisser ou cliquer pour uploader'}
          </p>
        </label>
        {errors.images && <p className="text-red-400/80 text-xs mt-2">{errors.images}</p>}

        {form.images.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
            {form.images.map((url, i) => (
              <div key={i} className="relative aspect-square bg-white/5 overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button"
                  onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={18} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="flex gap-3 pt-4 border-t border-white/8">
        <button type="submit" disabled={saving || uploading} className="admin-btn-primary flex-1 justify-center">
          {saving && <Loader2 size={13} className="animate-spin" />}
          {saving ? 'Enregistrement…' : isEditing ? 'Mettre à jour' : 'Créer le produit'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="admin-btn-ghost">Annuler</button>
        )}
      </div>
    </form>
  )
}

export default AdminProductForm