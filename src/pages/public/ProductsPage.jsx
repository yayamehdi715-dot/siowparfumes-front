import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../utils/api'
import ProductGrid from '../../Components/public/ProductGrid'
import { useLanguage } from '../../context/LanguageContext'

const CATEGORIES_SLUGS = ['Watches', 'Fragrances', 'Saudi Coll.', 'Essentials']

// ─── Correspondance slug URL → catégorie en base ──────────────────────────────
// Les slugs dans l'URL sont en anglais, les catégories en DB sont en français.
const SLUG_TO_DB = {
  'Watches':     'Montres',
  'Fragrances':  'Parfums',
  'Saudi Coll.': 'Parfums Saoudiens',
  'Essentials':  'Essentiels',
}

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState(searchParams.get('search') || '')
  const { t } = useLanguage()
  const activeCategory = searchParams.get('category') || t.all

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => products.filter((p) => {
    const isAll = activeCategory === t.all || activeCategory === 'Tous'
    // Convertir le slug URL vers le nom DB avant de comparer
    const dbCategory  = SLUG_TO_DB[activeCategory] || activeCategory
    const matchCat    = isAll || p.category === dbCategory
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  }), [products, activeCategory, search, t.all])

  const setCategory = (cat) => {
    if (cat === t.all) searchParams.delete('category')
    else searchParams.set('category', cat)
    setSearchParams(searchParams)
  }

  const CATEGORIES = [t.all, ...CATEGORIES_SLUGS]

  // Titre affiché : utilise le label traduit si dispo, sinon le slug
  const pageTitle = (activeCategory === t.all || activeCategory === 'Tous')
    ? t.fullCatalog
    : (t.categoryLabels?.[activeCategory] ?? activeCategory)

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="pt-24 lg:pt-36 pb-10 lg:pb-16 px-6 lg:px-16 xl:px-24 bg-surface-container-low">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[2px] bg-amber-400" />
              <span className="stitch-label">{t.shop}</span>
            </div>
            <h1 className="font-headline text-on-surface text-5xl lg:text-7xl font-bold
                           tracking-tighter leading-tight">
              {pageTitle}
            </h1>
            <p className="stitch-label mt-3">
              {loading ? '—' : t.articleCount(filtered.length)}
            </p>
          </div>

          {/* Desktop search */}
          <div className="hidden lg:flex items-center gap-3 bg-surface-container px-4 py-2.5
                          border-b border-amber-400/30">
            <span className="material-symbols-outlined text-outline text-[18px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchItem}
              className="bg-transparent text-on-surface font-body text-sm outline-none w-56
                         placeholder:text-outline" />
            {search && (
              <button onClick={() => setSearch('')} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div className="sticky top-[57px] lg:top-[97px] z-40 bg-[#F9F9F9]/90 backdrop-blur-xl
                      border-b border-outline-variant/30">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 py-3
                        flex items-center gap-3 overflow-x-auto hide-scrollbar">

          {/* Mobile search */}
          <div className="relative flex-shrink-0 lg:hidden">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                             text-outline text-[18px] pointer-events-none"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchMobile}
              className="bg-surface-container text-on-surface font-body text-xs
                         pl-9 pr-4 py-2 outline-none w-36 placeholder:text-outline" />
          </div>
          <div className="h-6 w-px bg-outline-variant flex-shrink-0 lg:hidden" />

          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat ||
              (activeCategory === 'Tous' && cat === t.all)
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 lg:px-6 py-2 font-label text-[0.6875rem] uppercase
                            tracking-[0.1rem] transition-all duration-200
                            ${isActive
                              ? 'bg-amber-400 text-black font-bold'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}>
                {cat === t.all ? cat : (t.categoryLabels?.[cat] ?? cat)}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 py-10 pb-32">
        <ProductGrid products={filtered} loading={loading} emptyMessage={t.emptyCategory} />
      </div>
    </div>
  )
}

export default ProductsPage