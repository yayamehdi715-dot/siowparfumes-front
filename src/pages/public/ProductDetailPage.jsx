import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'
import SizeSelector from '../../Components/public/SizeSelector'
import QuantitySelector from '../../Components/public/QuantitySelector'
import toast from 'react-hot-toast'

const PARFUM_CATS = ['Parfums', 'Parfums Saoudiens']

function ProductDetailPage() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const { addToCart } = useCart()
  const { t }         = useLanguage()
  const [product, setProduct]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity]         = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [achatMode, setAchatMode]       = useState('flacon')
  const [selectedExtrait, setSelectedExtrait] = useState(null)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        const p = res.data
        setProduct(p)
        if (!PARFUM_CATS.includes(p.category)) {
          // Sélectionner la première taille disponible
          const first = p.sizes?.[0]
          if (first) setSelectedSize(first.size)
        } else {
          // Sélectionner le premier extrait disponible
          const firstExtrait = p.extraits?.[0]
          if (firstExtrait) setSelectedExtrait(firstExtrait)
        }
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center pt-20">
      <div className="w-8 h-8 border border-outline-variant border-t-primary rounded-full animate-spin" />
    </div>
  )
  if (!product) return null

  const isParfum    = PARFUM_CATS.includes(product.category)
  const images      = product.images?.length > 0 ? product.images : ['/placeholder.jpg']
  const extraits    = product.extraits ?? []
  const hasExtraits = extraits.length > 0

  const prixAffiche = isParfum
    ? (achatMode === 'extrait' && selectedExtrait ? selectedExtrait.price : product.price)
    : product.price

  const handleAddToCart = () => {
    if (isParfum) {
      if (achatMode === 'flacon') {
        addToCart(product, 'Flacon complet', quantity, { type: 'flacon', price: product.price })
      } else {
        if (!selectedExtrait) { toast.error(t.toastSelectVolume); return }
        addToCart(product, `${selectedExtrait.ml} ml`, quantity, {
          type: 'extrait', ml: selectedExtrait.ml, price: selectedExtrait.price,
        })
      }
    } else {
      if (!selectedSize) { toast.error(t.toastSelectSize); return }
      addToCart(product, selectedSize, quantity)
    }
    toast.success(t.toastAdded(product.name))
  }

  return (
    <div className="min-h-screen bg-surface pt-16 lg:pt-28 pb-32">

      {/* Back */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 pt-6 pb-4">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 stitch-label hover:text-on-surface transition-colors group">
          <span className="material-symbols-outlined text-[18px]
                           group-hover:-translate-x-1 transition-transform"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>arrow_back</span>
          {t.back}
        </button>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-20">

          {/* ── Galerie ──────────────────────────────────────── */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-32 lg:self-start">
            <div className="relative aspect-[3/4] bg-surface-container overflow-hidden group">
              <img src={images[currentImage]} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

              <div className="absolute top-4 left-4">
                <span className="stitch-label bg-surface-container-lowest/90 px-3 py-1.5 text-on-surface">
                  {product.category}
                </span>
              </div>

              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage((i) => i === 0 ? images.length - 1 : i - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10
                               bg-surface-container-lowest/90 flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                    <span className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>chevron_left</span>
                  </button>
                  <button onClick={() => setCurrentImage((i) => i === images.length - 1 ? 0 : i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10
                               bg-surface-container-lowest/90 flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                    <span className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)}
                    className={`aspect-[3/4] overflow-hidden border transition-all
                                ${i === currentImage
                                  ? 'border-primary'
                                  : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Infos produit ─────────────────────────────────── */}
          <div className="flex flex-col gap-8 animate-fade-up lg:pt-4">

            <div>
              {product.brand && <p className="stitch-label mb-2">{product.brand}</p>}
              <h1 className="font-headline text-on-surface text-4xl lg:text-5xl xl:text-6xl
                             font-bold leading-tight tracking-tighter mb-5">
                {product.name}
              </h1>
              <p className="font-label text-[1.25rem] lg:text-[1.5rem] uppercase tracking-[0.05rem]
                             text-secondary font-semibold">
                {(prixAffiche ?? 0).toLocaleString('fr-DZ')}
                <span className="text-sm text-on-surface-variant font-normal ml-2">DZD</span>
              </p>
            </div>

            <div className="h-px bg-surface-container-high" />

            {/* ── Sélection PARFUMS ───────────────────────────── */}
            {isParfum ? (
              <>
                {hasExtraits && (
                  <div>
                    <p className="stitch-label mb-4">{t.purchaseMode}</p>
                    <div className="flex gap-0 border border-outline-variant w-fit">
                      <button
                        onClick={() => { setAchatMode('flacon'); setQuantity(1) }}
                        className={`px-5 py-3 font-label text-[0.6875rem] uppercase tracking-[0.1rem]
                                    transition-all duration-200
                                    ${achatMode === 'flacon'
                                      ? 'bg-primary text-on-primary border-primary'
                                      : 'text-on-surface-variant hover:text-on-surface'}`}>
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1.5"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>water_drop</span>
                        {t.fullBottle}
                      </button>
                      <button
                        onClick={() => { setAchatMode('extrait'); setQuantity(1) }}
                        className={`px-5 py-3 font-label text-[0.6875rem] uppercase tracking-[0.1rem]
                                    transition-all duration-200 border-l border-outline-variant
                                    ${achatMode === 'extrait'
                                      ? 'bg-primary text-on-primary border-primary'
                                      : 'text-on-surface-variant hover:text-on-surface'}`}>
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1.5"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>science</span>
                        {t.extraits}
                      </button>
                    </div>
                  </div>
                )}

                {achatMode === 'flacon' && (
                  <div className="bg-surface-container-low p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-label text-[0.75rem] uppercase tracking-[0.1rem] text-on-surface">
                        {t.fullBottle}
                      </p>
                    </div>
                    <p className="font-label text-[1.125rem] text-secondary font-semibold">
                      {(product.price ?? 0).toLocaleString('fr-DZ')}
                      <span className="text-xs text-on-surface-variant font-normal ml-1.5">DZD</span>
                    </p>
                  </div>
                )}

                {achatMode === 'extrait' && (
                  <div>
                    <p className="stitch-label mb-4">{t.chooseVolume}</p>
                    <div className="flex flex-wrap gap-2">
                      {extraits.map((ex) => {
                        const isSelected = selectedExtrait?.ml === ex.ml
                        return (
                          <button
                            key={ex.ml}
                            onClick={() => { setSelectedExtrait(ex); setQuantity(1) }}
                            className={`flex flex-col items-center px-4 py-3 border min-w-[72px]
                                        font-label transition-all duration-200
                                        ${isSelected
                                          ? 'bg-primary text-on-primary border-primary'
                                          : 'border-outline-variant text-on-surface hover:border-primary bg-transparent'}`}>
                            <span className="text-[0.875rem] font-semibold">{ex.ml} ml</span>
                            <span className={`text-[0.6rem] uppercase tracking-widest mt-0.5
                                              ${isSelected ? 'text-on-primary/70' : 'text-outline'}`}>
                              {ex.price.toLocaleString('fr-DZ')} DZD
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ── Sélection MONTRES / ESSENTIELS ──────────────── */
              <div>
                <p className="stitch-label mb-4">
                  {t.size}
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
              </div>
            )}

            <div>
              <p className="stitch-label mb-4">{t.quantity}</p>
              <QuantitySelector value={quantity} min={1} max={99} onChange={setQuantity} />
            </div>

            <button onClick={handleAddToCart}
              className="btn-primary w-full py-5 justify-center text-sm lg:text-base">
              <span className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>shopping_bag</span>
              {t.addToCart}
            </button>

            {product.description && (
              <>
                <div className="h-px bg-surface-container-high" />
                <div>
                  <p className="stitch-label mb-4">{t.description}</p>
                  <p className="font-body text-on-surface-variant leading-relaxed text-sm lg:text-base">
                    {product.description}
                  </p>
                </div>
              </>
            )}

            <div className="bg-surface-container-low p-5 flex items-start gap-4">
              <span className="material-symbols-outlined text-on-surface-variant mt-0.5"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>local_shipping</span>
              <div>
                <p className="font-body font-semibold text-on-surface text-sm mb-0.5">
                  {t.deliveryAlgeria}
                </p>
                <p className="font-body text-on-surface-variant text-xs">
                  {t.deliveryDetails}
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