import { useState } from 'react'
import { Plus, Trash2, Upload, X, Loader2 } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Watches', 'Fragrances', 'Saudi Coll.', 'Essentials']

const EMPTY = {
  name: '', brand: '', category: 'Fragrances', price: '',
  description: '', sizes: [{ size: '', stock: '' }],
  images: [], tags: [], bestSeller: false, featured: false,
}

function AdminProductForm({ initialData, onSuccess, onCancel }) {
  const isEditing = !!initialData
  const [form, setForm] = useState(
    initialData ? {
      ...initialData,
      price:  initialData.price.toString(),
      sizes:  initialData.sizes?.length > 0
        ? initialData.sizes.map((s) => ({ size: s.size.toString(), stock: s.stock.toString() }))
        : [{ size: '', stock: '' }],
      images: initialData.images || [],
      tags:   initialData.tags   || [],
      bestSeller: initialData.bestSeller || false,
      featured:   initialData.featured   || false,
    } : EMPTY
  )
  const [errors, setErrors]   = useState({})
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }))
    setErrors((p) => ({ ...p, [key]: '' }))
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  // Sizes
  const addSize    = () => setForm((p) => ({ ...p, sizes: [...p.sizes, { size: '', stock: '' }] }))
  const removeSize = (i) => setForm((p) => ({ ...p, sizes: p.sizes.filter((_, idx) => idx !== i) }))
  const updateSize = (i, field, val) =>
    setForm((p) => ({ ...p, sizes: p.sizes.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }))

  // Upload
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
    if (!form.name.trim())  e.name  = 'Nom requis'
    if (!form.price || isNaN(+form.price) || +form.price <= 0) e.price = 'Prix invalide'
    if (!isEditing && form.images.length === 0) e.images = 'Au moins une image requise'
    const ok = form.sizes.every((s) => s.size.toString().trim() && !isNaN(+s.stock) && +s.stock >= 0)
    if (!ok) e.sizes = 'Toutes les tailles doivent avoir un stock valide'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        ...form, price: +form.price,
        sizes: form.sizes.filter((s) => s.size.toString().trim()).map((s) => ({ size: s.size, stock: +s.stock })),
      }
      if (isEditing) await api.put(`/products/${initialData._id}`, payload)
      else           await api.post('/products', payload)
      toast.success(isEditing ? 'Produit mis à jour' : 'Produit créé')
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally { setSaving(false) }
  }

  const FieldSet = ({ label, error, children }) => (
    <div>
      <label className="admin-label">{label}</label>
      {children}
      {error && <p className="text-red-400/80 text-xs mt-1.5">{error}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>

      {/* ── Infos de base ─────────────────────────────────────── */}
      <div>
        <p className="admin-label mb-4 text-white/60">Informations générales</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldSet label="Nom du produit *" error={errors.name}>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Ex: Oud Royal..." className="admin-input" />
          </FieldSet>
          <FieldSet label="Marque">
            <input name="brand" value={form.brand} onChange={handleChange}
              placeholder="Ex: Amouage..." className="admin-input" />
          </FieldSet>
          <FieldSet label="Catégorie *">
            <div className="relative">
              <select name="category" value={form.category} onChange={handleChange}
                className="admin-select pr-8">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2
                               text-white/25 text-[16px] pointer-events-none"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>expand_more</span>
            </div>
          </FieldSet>
          <FieldSet label="Prix (DZD) *" error={errors.price}>
            <input name="price" value={form.price} onChange={handleChange}
              type="number" min="0" placeholder="Ex: 4500"
              className="admin-input" />
          </FieldSet>
        </div>
        <div className="mt-4">
          <FieldSet label="Description">
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Décrivez le produit..."
              className="admin-input resize-none" />
          </FieldSet>
        </div>
      </div>

      {/* ── Flags ─────────────────────────────────────────────── */}
      <div>
        <p className="admin-label mb-4 text-white/60">Mise en avant</p>
        <div className="flex flex-wrap gap-4">
          {[
            { key: 'bestSeller', label: 'Best Seller' },
            { key: 'featured',   label: 'Mis en avant' },
          ].map(({ key, label }) => (
            <label key={key}
              className={`flex items-center gap-3 px-5 py-3 border cursor-pointer
                          transition-all duration-200
                          ${form[key]
                            ? 'border-[#8C495F]/60 bg-[#8C495F]/10 text-white'
                            : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
              <input type="checkbox" className="sr-only"
                checked={form[key]} onChange={() => set(key, !form[key])} />
              <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0
                               ${form[key] ? 'border-[#8C495F] bg-[#8C495F]' : 'border-white/20'}`}>
                {form[key] && (
                  <span className="material-symbols-outlined text-white text-[12px]"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check</span>
                )}
              </div>
              <span className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Tailles & Stocks ──────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="admin-label text-white/60">Tailles & Stocks *</p>
          <button type="button" onClick={addSize}
            className="flex items-center gap-1.5 text-white/40 hover:text-white
                       font-label text-[0.6875rem] uppercase tracking-[0.1rem] transition-colors">
            <Plus size={12} /> Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {form.sizes.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <input value={s.size} onChange={(e) => updateSize(i, 'size', e.target.value)}
                placeholder="Taille (ex: M, 44, XL…)"
                className="admin-input flex-1" />
              <input type="number" min="0" value={s.stock}
                onChange={(e) => updateSize(i, 'stock', e.target.value)}
                placeholder="Stock"
                className="admin-input w-28" />
              <button type="button" onClick={() => removeSize(i)}
                className="p-2 text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        {errors.sizes && <p className="text-red-400/80 text-xs mt-2">{errors.sizes}</p>}
      </div>

      {/* ── Images ────────────────────────────────────────────── */}
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
                <button type="button" onClick={() =>
                  setForm((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
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
          <button type="button" onClick={onCancel} className="admin-btn-ghost">
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}

export default AdminProductForm