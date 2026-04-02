import QuantitySelector from './QuantitySelector'
import { useCart } from '../../context/CartContext'

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <div className="flex gap-4 p-4 bg-surface-container-lowest">
      {/* Image */}
      <div className="w-20 h-24 sm:w-24 sm:h-28 overflow-hidden bg-surface-container flex-shrink-0">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-surface-container" />}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {item.brand && (
            <p className="font-label text-[0.625rem] uppercase tracking-[0.15rem] text-outline mb-0.5">
              {item.brand}
            </p>
          )}
          <h4 className="font-headline text-on-surface text-base leading-tight">{item.name}</h4>
          <span className="inline-block mt-1.5 stitch-label text-secondary">
            Taille {item.size}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <QuantitySelector
            value={item.quantity}
            min={1}
            max={item.maxStock}
            onChange={(qty) => updateQuantity(item.key, qty)}
          />
          <div className="flex items-center gap-4">
            <span className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary font-semibold">
              {(item.price * item.quantity).toLocaleString('fr-DZ')} DZD
            </span>
            <button
              onClick={() => removeFromCart(item.key)}
              className="p-2 text-outline hover:text-error transition-colors"
              aria-label="Retirer"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                delete
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItem
