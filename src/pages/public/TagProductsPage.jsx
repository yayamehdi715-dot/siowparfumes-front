import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import ProductGrid from '../../Components/public/ProductGrid'
import { useLanguage } from '../../context/LanguageContext'

function TagProductsPage() {
  const { tag }    = useParams()
  const navigate   = useNavigate()
  const { t }      = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  const tagInfo = t.tagInfo[tag]

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    if (!tagInfo) { navigate('/'); return }
    setLoading(true)
    // Use original English title for API filtering (tags stored in DB by French title)
    const frTitles = {
      'look-bebe-printemps': 'Look Bébé Printemps',
      'look-femme-casual':   'Look Femme Casual',
      'idees-de-cadeaux':    'Idées de cadeaux',
    }
    const filterTitle = frTitles[tag] || tagInfo.title
    api.get('/products')
      .then((res) => {
        const filtered = (res.data || []).filter((p) => p.tags && p.tags.includes(filterTitle))
        setProducts(filtered)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tag, tagInfo, navigate])

  if (!tagInfo) return null

  return (
    <div className="min-h-screen bg-surface pt-16 pb-32">

      {/* Header */}
      <div className="bg-surface-container-low pt-12 pb-12 px-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 stitch-label hover:text-on-surface transition-colors mb-8 group"
        >
          <span
            className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
          >
            arrow_back
          </span>
          {t.backToHome}
        </button>
        <span className="stitch-label block mb-3">{t.collection}</span>
        <h1 className="font-headline text-on-surface text-4xl sm:text-5xl font-bold tracking-tighter leading-tight mb-3">
          {tagInfo.title}
        </h1>
        <p className="font-body text-on-surface-variant text-sm">{tagInfo.description}</p>
        {!loading && (
          <p className="stitch-label mt-4">
            {products.length} {products.length === 1 ? 'منتج' : 'منتجات'}
          </p>
        )}
      </div>

      {/* Products */}
      <div className="px-6 py-10">
        {products.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-surface-container flex items-center justify-center mb-8">
              <span
                className="material-symbols-outlined text-outline text-3xl"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}
              >
                search_off
              </span>
            </div>
            <p className="font-headline text-on-surface text-2xl mb-2">{t.comingSoon}</p>
            <p className="stitch-label mb-10">{t.comingSoonDesc}</p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              {t.seeAllCatalog}
            </button>
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </div>
    </div>
  )
}

export default TagProductsPage