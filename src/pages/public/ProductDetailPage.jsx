import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { useCart } from '../../context/CartContext'
import SizeSelector from '../../Components/public/SizeSelector'
import QuantitySelector from '../../Components/public/QuantitySelector'
import toast from 'react-hot-toast'

function ProductDetailPage() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity]         = useState(1)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data)
        const first = res.data.sizes?.find((s) => s.stock > 0)
        if (first) setSelectedSize(first.size)
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center pt-20">
      <div className="w-8 h-8 border border-outline-variant border-t-primary
                      rounded-full animate-spin" />
    </div>
  )

  if (!product) return null

  const maxStock = product.sizes?.find((s) => s.size === selectedSize)?.stock || 1
  const images   = product.images?.length > 0 ? product.images : ['/placeholder.jpg']

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Veuillez sélectionner une taille'); return }
    addToCart(product, selectedSize, quantity)
    toast.success(`${product.name} ajouté au panier`)
  }

  return (
    <div className="min-h-screen bg-surface pt-16 pb-32">

      {/* Back button */}
      <div className="px-6 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 stitch-label hover:text-on-surface transition-colors group"
        >
          <span
            className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
          >
            arrow_back
          </span>
          Retour
        </button>
      </div>

      <div className="px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">

          {/* ── Gallery ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-[3/4] bg-surface-container overflow-hidden group">
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Category badge */}
              <div className="absolute top-4 left-4">
                <span className="stitch-label bg-surface-container-lowest/90 px-3 py-1.5 text-on-surface">
                  {product.category}
                </span>
              </div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((i) => i === 0 ? images.length - 1 : i - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10
                               bg-surface-container-lowest/90 flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <span className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                      chevron_left
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentImage((i) => i === images.length - 1 ? 0 : i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10
                               bg-surface-container-lowest/90 flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <span className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                      chevron_right
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`aspect-[3/4] overflow-hidden border transition-all
                                ${i === currentImage
                                  ? 'border-primary'
                                  : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ──────────────────────────────────────── */}
          <div className="flex flex-col gap-8 animate-fade-up">

            {/* Name & price */}
            <div>
              {product.brand && (
                <p className="stitch-label mb-2">{product.brand}</p>
              )}
              <h1 className="font-headline text-on-surface text-4xl sm:text-5xl font-bold
                             leading-tight tracking-tighter mb-5">
                {product.name}
              </h1>
              <p className="font-label text-[1.25rem] uppercase tracking-[0.05rem] text-secondary font-semibold">
                {(product.price ?? 0).toLocaleString('fr-DZ')}
                <span className="text-sm text-on-surface-variant font-normal ml-2">DZD</span>
              </p>
            </div>

            {/* Visual separator — color shift, no border */}
            <div className="h-px bg-surface-container-high" />

            {/* Size */}
            <div>
              <p className="stitch-label mb-4">
                Taille
                {selectedSize && (
                  <span className="ml-3 text-secondary normal-case tracking-normal font-semibold">
                    {selectedSize}
                  </span>
                )}
              </p>
              <SizeSelector
                sizes={product.sizes || []}
                selected={selectedSize}
                onChange={(size) => { setSelectedSize(size); setQuantity(1) }}
              />
              {selectedSize && (
                <p className="font-body text-[0.75rem] text-outline mt-2">
                  {maxStock} disponible{maxStock > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <p className="stitch-label mb-4">Quantité</p>
              <QuantitySelector value={quantity} min={1} max={maxStock} onChange={setQuantity} />
            </div>

            {/* Add to cart */}
            <button onClick={handleAddToCart} className="btn-primary w-full py-4 justify-center text-sm">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                shopping_bag
              </span>
              Ajouter au Panier
            </button>

            {/* Description */}
            {product.description && (
              <>
                <div className="h-px bg-surface-container-high" />
                <div>
                  <p className="stitch-label mb-4">Description</p>
                  <p className="font-body text-on-surface-variant leading-relaxed text-sm">
                    {product.description}
                  </p>
                </div>
              </>
            )}

            {/* Delivery info */}
            <div className="bg-surface-container-low p-5 flex items-start gap-4">
              <span
                className="material-symbols-outlined text-on-surface-variant mt-0.5"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                local_shipping
              </span>
              <div>
                <p className="font-body font-semibold text-on-surface text-sm mb-0.5">
                  Livraison dans toute l'Algérie
                </p>
                <p className="font-body text-on-surface-variant text-xs">
                  Paiement à la livraison · 2 à 5 jours ouvrables
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
