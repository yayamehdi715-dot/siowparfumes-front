function QuantitySelector({ value, min = 1, max = 99, onChange }) {
  return (
    <div className="flex items-center bg-surface-container w-fit">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center text-on-surface-variant
                   hover:text-on-surface hover:bg-surface-container-high transition-colors
                   disabled:opacity-30 font-light text-lg"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)))
        }}
        className="w-10 h-10 bg-transparent text-center text-on-surface font-body font-semibold
                   text-sm outline-none"
      />
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center text-on-surface-variant
                   hover:text-on-surface hover:bg-surface-container-high transition-colors
                   disabled:opacity-30 font-light text-lg"
      >
        +
      </button>
    </div>
  )
}

export default QuantitySelector
