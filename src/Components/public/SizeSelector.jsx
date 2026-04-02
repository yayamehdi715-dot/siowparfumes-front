function SizeSelector({ sizes = [], selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(({ size }) => {
        const isSelected = selected === size
        return (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`min-w-[44px] h-10 px-3 font-label text-[0.6875rem] uppercase
                        tracking-[0.1rem] transition-all duration-200 border
                        ${isSelected
                          ? 'bg-primary text-on-primary border-primary'
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