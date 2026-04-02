import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { label: 'Bébé',        slug: 'Bébé' },
  { label: 'Enfants',     slug: 'Enfants' },
  { label: 'Femme',       slug: 'Femme' },
  { label: 'Homme',       slug: 'Homme' },
  { label: 'Lingerie',    slug: 'Lingerie' },
  { label: 'Accessoires', slug: 'Accessoires' },
]

/* ── Horizontal scrollable product card ─────────────────────── */
function DropCard({ product }) {
  const { addToCart } = useCart()
  const hasStock = product.sizes?.some((s) => s.stock > 0)
  const image    = product.images?.[0] || '/placeholder.jpg'
  const firstAvailableSize = product.sizes?.find((s) => s.stock > 0)?.size

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!hasStock || !firstAvailableSize) { toast.error('Épuisé'); return }
    addToCart(product, firstAvailableSize, 1)
    toast.success(`${product.name} ajouté au panier`)
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="flex-shrink-0 w-44 group block"
    >
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

/* ── Main ────────────────────────────────────────────────────── */
function HomePage() {
  const [products, setProducts] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading]   = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        const all = res.data || []
        setProducts(all.slice(0, 10))
        setFeatured(all.slice(0, 3))
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

        {/* Bottom-left editorial block */}
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

        {/* Scroll indicator */}
        <div className="absolute right-6 bottom-16 flex flex-col gap-3 items-center text-white/40">
          <div className="h-12 w-[1px] bg-white/30" />
          <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-[0.2rem]">
            Scroll
          </span>
        </div>
      </section>

      {/* ── Derniers Drops — horizontal scroll ────────────────── */}
      <section className="py-20 bg-surface-container-low">
        <div className="px-6 mb-10 flex justify-between items-end">
          <div>
            <h3 className="text-3xl font-headline font-bold tracking-tight text-on-surface">
              Derniers Drops
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

        {/* Horizontal scroll list */}
        <div
          ref={scrollRef}
          className="flex gap-4 px-6 overflow-x-auto hide-scrollbar pb-2"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44">
                  <div className="aspect-[3/4] bg-surface-container animate-pulse mb-3" />
                  <div className="h-3 bg-surface-container animate-pulse w-3/4 mb-2" />
                  <div className="h-2.5 bg-surface-container animate-pulse w-1/2" />
                </div>
              ))
            : products.map((p) => <DropCard key={p._id} product={p} />)
          }
        </div>
      </section>

      {/* ── Collection Signature — dark banner ────────────────── */}
      <section className="bg-primary-container px-6 py-16">
        <div className="mb-8">
          <p className="text-[0.6875rem] uppercase tracking-[0.2rem] text-white/50 mb-3">
            Exclusivité
          </p>
          <h3 className="text-3xl font-headline font-bold text-white tracking-tighter mb-4">
            Collection<br />Signature
          </h3>
          <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
            Sélection rare de pièces d'exception. Chaque article est choisi pour
            son caractère unique et sa qualité irréprochable.
          </p>
          <Link to="/products" className="btn-primary">
            Découvrir la Gamme
          </Link>
        </div>

        {/* Mini product thumbnails */}
        {featured.length > 0 && (
          <div className="flex gap-3 mt-8">
            {featured.map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="flex-1 group"
              >
                <div className="aspect-square bg-surface-container overflow-hidden mb-2">
                  <img
                    src={p.images?.[0] || '/placeholder.jpg'}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="font-label text-[0.6rem] uppercase tracking-[0.1rem] text-white/60 truncate">
                  {p.name}
                </p>
                <p className="font-label text-[0.6rem] text-secondary">
                  {(p.price ?? 0).toLocaleString('fr-DZ')} DZD
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Archives — editorial alternating ──────────────────── */}
      <section className="py-24 px-6 bg-surface-container-highest">
        <div className="text-center mb-16">
          <span className="text-secondary font-headline italic text-lg block mb-2">Exclusivité</span>
          <h3 className="text-4xl font-headline font-bold tracking-tighter text-on-surface">
            Archives & Collection
          </h3>
          <div className="h-px w-12 bg-primary mx-auto mt-6" />
        </div>

        <div className="space-y-12">
          {/* Feature 1 */}
          <div className="flex flex-col gap-6 items-start">
            <div className="w-full aspect-square overflow-hidden bg-surface-container">
              <img
                src="/hero-family.jpg"
                alt="L'Essence de la Collection"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-2xl font-headline font-bold text-on-surface">
                L'Essence de l'Orient
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Une collection rare puisant dans les traditions millénaires, réinventée
                pour le contemporain.
              </p>
              <Link to="/products" className="btn-outline inline-flex">
                Explorer l'Héritage
              </Link>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col gap-6 items-end text-right">
            <div className="w-full aspect-square overflow-hidden bg-surface-container">
              <img
                src="/hero-family.jpg"
                alt="Collection Exclusive"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-2xl font-headline font-bold text-on-surface">
                Éditions Limitées
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Des pièces numérotées arborant des designs exclusifs. Disponibles en
                quantité très limitée.
              </p>
              <p className="text-sm font-bold text-secondary">Série Numérotée</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Grid — asymmetric staggered ──────────────── */}
      <section className="px-6 py-24">
        <h3 className="stitch-label text-center mb-12 tracking-[0.4rem]">Catégories</h3>
        <div className="grid grid-cols-2 grid-rows-3 gap-2 h-[520px]">

          {/* col 1, row-span-2 */}
          <Link
            to="/products?category=Bébé"
            className="col-span-1 row-span-2 bg-surface-container relative flex items-end p-5 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <span className="relative z-10 stitch-label text-white">Bébé</span>
          </Link>

          {/* col 2, row-span-1 */}
          <Link
            to="/products?category=Femme"
            className="col-span-1 row-span-1 bg-surface-container-high relative flex items-end p-5 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="relative z-10 stitch-label text-white">Femme</span>
          </Link>

          {/* col 2, row-span-2 */}
          <Link
            to="/products?category=Homme"
            className="col-span-1 row-span-2 bg-surface-container-highest relative flex items-end p-5 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="relative z-10 stitch-label text-white">Homme</span>
          </Link>

          {/* col 1, row-span-1 */}
          <Link
            to="/products?category=Enfants"
            className="col-span-1 row-span-1 bg-surface-container-low relative flex items-end p-5 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="relative z-10 stitch-label text-white">Enfants</span>
          </Link>
        </div>
      </section>

      {/* ── Editorial Marquee ─────────────────────────────────── */}
      <div className="overflow-hidden py-5 bg-surface-container-high">
        <div className="whitespace-nowrap animate-marquee inline-block">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="inline-block mx-10 font-headline italic text-on-surface-variant text-sm"
            >
              SIOW PARFUMES &nbsp;·&nbsp; Livraison 58 Wilayas &nbsp;·&nbsp;
              Paiement à la Livraison &nbsp;·&nbsp; Haute Curation &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}

export default HomePage
