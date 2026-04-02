import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { label: 'Watches',          slug: 'Watches' },
  { label: 'Fragrances',       slug: 'Fragrances' },
  { label: 'Saudi Coll.',      slug: 'Saudi Coll.' },
  { label: 'Essentials',       slug: 'Essentials' },
]

function DropCard({ product }) {
  const { addToCart } = useCart()
  const hasStock           = product.sizes?.some((s) => s.stock > 0)
  const image              = product.images?.[0] || '/placeholder.jpg'
  const firstAvailableSize = product.sizes?.find((s) => s.stock > 0)?.size

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!hasStock || !firstAvailableSize) { toast.error('Épuisé'); return }
    addToCart(product, firstAvailableSize, 1)
    toast.success(`${product.name} ajouté au panier`)
  }

  return (
    <Link to={`/products/${product._id}`} className="flex-shrink-0 w-44 group block">
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface-container mb-3">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {!hasStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="stitch-label text-outline">Épuisé</span>
          </div>
        )}
        {hasStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-0 left-0 right-0 bg-primary text-on-primary
                       font-label text-[0.6rem] uppercase tracking-[0.15rem] py-2.5
                       translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            + Panier
          </button>
        )}
      </div>
      <p className="font-body text-[0.6875rem] uppercase tracking-[0.1rem] text-on-surface leading-snug mb-1">
        {product.name}
      </p>
      <p className="font-label text-[0.6875rem] text-secondary font-semibold">
        {(product.price ?? 0).toLocaleString('fr-DZ')} DZD
      </p>
    </Link>
  )
}

function HomePage() {
  const [nouveautes, setNouveautes]     = useState([])
  const [bestSellers, setBestSellers]   = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        const all = res.data || []
        setNouveautes(all.slice(0, 10))
        // Best sellers = produits avec le plus de stock commandé, on prend une autre tranche
        setBestSellers(all.slice(0, 8))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <img
          src="/hero-family.jpg"
          alt="Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        <div className="absolute bottom-16 left-6 z-10 max-w-sm">
          <span className="text-[0.6875rem] uppercase tracking-[0.3rem] text-white/80 mb-4 block animate-fade-up">
            Collection 2024
          </span>
          <h2
            className="text-5xl font-headline font-bold text-white leading-[0.9] tracking-tighter mb-6 animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            L'ÉVEIL<br />DES SENS
          </h2>
          <p
            className="text-white/70 text-sm mb-8 leading-relaxed animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            Une curation exclusive de pièces d'exception, entre élégance
            intemporelle et contemporanéité maîtrisée.
          </p>
          <Link
            to="/products"
            className="bg-white text-black px-8 py-4 text-[0.6875rem] uppercase
                       tracking-[0.2rem] font-bold active:scale-95 transition-transform inline-block
                       animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            Découvrir l'Atelier
          </Link>
        </div>

        <div className="absolute right-6 bottom-16 flex flex-col gap-3 items-center text-white/40">
          <div className="h-12 w-[1px] bg-white/30" />
          <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-[0.2rem]">Scroll</span>
        </div>
      </section>

      {/* ── Nouveautés — horizontal scroll ────────────────────── */}
      <section className="py-20 bg-surface-container-low">
        <div className="px-6 mb-10 flex justify-between items-end">
          <div>
            <h3 className="text-3xl font-headline font-bold tracking-tight text-on-surface">
              Nouveautés
            </h3>
            <p className="stitch-label mt-2">Sélection Archive 2024</p>
          </div>
          <Link
            to="/products"
            className="stitch-label border-b border-primary pb-1 hover:text-secondary transition-colors"
          >
            Voir tout
          </Link>
        </div>

        <div className="flex gap-4 px-6 overflow-x-auto hide-scrollbar pb-2">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44">
                  <div className="aspect-[3/4] bg-surface-container animate-pulse mb-3" />
                  <div className="h-3 bg-surface-container animate-pulse w-3/4 mb-2" />
                  <div className="h-2.5 bg-surface-container animate-pulse w-1/2" />
                </div>
              ))
            : nouveautes.map((p) => <DropCard key={p._id} product={p} />)
          }
        </div>
      </section>

      {/* ── Best Sellers ──────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="px-6 mb-10 flex justify-between items-end">
          <div>
            <h3 className="text-3xl font-headline font-bold tracking-tight text-on-surface">
              Best Sellers
            </h3>
            <p className="stitch-label mt-2">Les plus populaires</p>
          </div>
          <Link
            to="/products"
            className="stitch-label border-b border-primary pb-1 hover:text-secondary transition-colors"
          >
            Voir tout
          </Link>
        </div>

        <div className="flex gap-4 px-6 overflow-x-auto hide-scrollbar pb-2">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44">
                  <div className="aspect-[3/4] bg-surface-container animate-pulse mb-3" />
                  <div className="h-3 bg-surface-container animate-pulse w-3/4 mb-2" />
                  <div className="h-2.5 bg-surface-container animate-pulse w-1/2" />
                </div>
              ))
            : bestSellers.map((p) => <DropCard key={p._id} product={p} />)
          }
        </div>
      </section>

      {/* ── Category Grid — asymmetric staggered ──────────────── */}
      <section className="px-6 py-24">
        <h3 className="stitch-label text-center mb-12 tracking-[0.4rem]">Catégories</h3>
        <div className="grid grid-cols-2 grid-rows-3 gap-2 h-[520px]">

          <Link
            to="/products?category=Watches"
            className="col-span-1 row-span-2 bg-surface-container relative flex items-end p-5 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <span className="relative z-10 stitch-label text-white">Watches</span>
          </Link>

          <Link
            to="/products?category=Fragrances"
            className="col-span-1 row-span-1 bg-surface-container-high relative flex items-end p-5 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="relative z-10 stitch-label text-white">Fragrances</span>
          </Link>

          <Link
            to="/products?category=Saudi Coll."
            className="col-span-1 row-span-2 bg-surface-container-highest relative flex items-end p-5 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="relative z-10 stitch-label text-white">Saudi Coll.</span>
          </Link>

          <Link
            to="/products?category=Essentials"
            className="col-span-1 row-span-1 bg-surface-container-low relative flex items-end p-5 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="relative z-10 stitch-label text-white">Essentials</span>
          </Link>
        </div>
      </section>

    </div>
  )
}

export default HomePage