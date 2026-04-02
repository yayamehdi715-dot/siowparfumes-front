import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../utils/api'
import ProductGrid from '../../Components/public/ProductGrid'

const CATEGORIES = ['Tous', 'Watches', 'Fragrances', 'Saudi Coll.', 'Essentials']

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState(searchParams.get('search') || '')
  const activeCategory = searchParams.get('category') || 'Tous'

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => products.filter((p) => {
    const matchCat    = activeCategory === 'Tous' || p.category === activeCategory
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  }), [products, activeCategory, search])

  const setCategory = (cat) => {
    if (cat === 'Tous') searchParams.delete('category')
    else searchParams.set('category', cat)
    setSearchParams(searchParams)
  }

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="pt-24 lg:pt-36 pb-10 lg:pb-16 px-6 lg:px-16 xl:px-24 bg-surface-container-low">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <span className="stitch-label block mb-3">Boutique</span>
            <h1 className="font-headline text-on-surface text-5xl lg:text-7xl font-bold
                           tracking-tighter leading-tight">
              {activeCategory === 'Tous' ? 'Catalogue Complet' : activeCategory}
            </h1>
            <p className="stitch-label mt-3">
              {loading ? '—' : `${filtered.length} article${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Desktop search inline in header */}
          <div className="hidden lg:flex items-center gap-3 bg-surface-container px-4 py-2.5
                          border-b border-outline-variant">
            <span className="material-symbols-outlined text-outline text-[18px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
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
              placeholder="Rechercher..."
              className="bg-surface-container text-on-surface font-body text-xs
                         pl-9 pr-4 py-2 outline-none w-36 placeholder:text-outline" />
          </div>
          <div className="h-6 w-px bg-outline-variant flex-shrink-0 lg:hidden" />

          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 lg:px-6 py-2 font-label text-[0.6875rem] uppercase
                          tracking-[0.1rem] transition-all duration-200
                          ${activeCategory === cat
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 py-10 pb-32">
        <ProductGrid products={filtered} loading={loading}
          emptyMessage="Aucun article dans cette catégorie." />
      </div>
    </div>
  )
}

export default ProductsPage