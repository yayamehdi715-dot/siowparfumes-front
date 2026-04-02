import ProductCard from './ProductCard.jsx'

function ProductGrid({ products, loading, emptyMessage = 'Aucun article trouvé.' }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest">
            <div className="aspect-[3/4] bg-surface-container animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-2.5 bg-surface-container animate-pulse w-1/3" />
              <div className="h-4 bg-surface-container animate-pulse w-4/5" />
              <div className="h-3 bg-surface-container animate-pulse w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 bg-surface-container flex items-center justify-center mb-8">
          <span className="material-symbols-outlined text-outline text-3xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}>inventory_2</span>
        </div>
        <p className="font-headline text-on-surface text-2xl mb-2">Aucun article</p>
        <p className="stitch-label mt-1">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
      {products.map((product, i) => (
        <div key={product._id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}

export default ProductGrid