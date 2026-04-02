function SizeSelector({ sizes = [], selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(({ size, stock }) => {
        const isSelected = selected === size
        const outOfStock = stock === 0
        return (
          <button
            key={size}
            onClick={() => !outOfStock && onChange(size)}
            disabled={outOfStock}
            className={`min-w-[44px] h-10 px-3 font-label text-[0.6875rem] uppercase
                        tracking-[0.1rem] transition-all duration-200 border
                        ${isSelected
                          ? 'bg-primary text-on-primary border-primary'
                          : outOfStock
                            ? 'border-outline-variant/40 text-outline cursor-not-allowed line-through bg-transparent'
                            : 'border-outline-variant text-on-surface hover:border-primary bg-transparent'
                        }`}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}

export default SizeSelector
