import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  const hasStock = product.sizes?.some((s) => s.stock > 0)
  const imageUrl = product.images?.[0] || '/placeholder.jpg'

  return (
    <Link to={`/products/${product._id}`} className="card-product block group">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-surface-container">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="stitch-label bg-surface-container-lowest/90 px-2 py-1 text-on-surface">
            {product.category}
          </span>
        </div>

        {/* Out of stock overlay */}
        {!hasStock && (
          <div className="absolute inset-0 bg-white/75 flex flex-col items-center justify-center gap-2">
            <span className="stitch-label text-outline">Épuisé</span>
            <span className="stitch-label text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
              Articles similaires →
            </span>
          </div>
        )}

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
        <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary font-semibold">
          {(product.price ?? 0).toLocaleString('fr-DZ')} DZD
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
