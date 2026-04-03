import { Link } from 'react-router-dom'

// URL optimisée Cloudinary pour les cartes produit (400px, auto qualité/format)
function getCardUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', '/upload/w_400,h_533,c_fill,q_auto:good,f_auto/')
}

function ProductCard({ product }) {
  const imageUrl = getCardUrl(product.images?.[0] || '')

  return (
    <Link to={`/products/${product._id}`} className="card-product block group">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-surface-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-outline text-3xl"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}>image</span>
          </div>
        )}

        {/* Accent doré au bas au hover */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]
                        bg-gradient-to-r from-amber-400/0 via-amber-400/70 to-amber-400/0
                        translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="stitch-label bg-surface-container-lowest/90 px-2 py-1 text-on-surface">
            {product.category}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />
      </div>

      {/* Info */}
      <div className="p-4 bg-surface-container-lowest">
        {product.brand && (
          <p className="font-label text-[0.625rem] uppercase tracking-[0.15rem] text-outline mb-1">
            {product.brand}
          </p>
        )}
        <h3 className="font-headline text-on-surface text-base leading-snug mb-2
                       group-hover:text-secondary transition-colors duration-300">
          {product.name}
        </h3>
        <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] font-semibold
                      flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-on-surface">
            {(product.price ?? 0).toLocaleString('fr-DZ')}
            <span className="text-outline font-normal ml-1">DZD</span>
          </span>
        </p>
      </div>
    </Link>
  )
}

export default ProductCard