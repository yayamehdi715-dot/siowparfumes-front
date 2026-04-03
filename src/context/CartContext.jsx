// src/contexts/CartContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

const ACTIONS = {
  ADD:        'ADD_TO_CART',
  REMOVE:     'REMOVE_FROM_CART',
  UPDATE_QTY: 'UPDATE_QUANTITY',
  CLEAR:      'CLEAR_CART',
  LOAD:       'LOAD_CART',
}

function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD:
      return action.payload

    case ACTIONS.ADD: {
      const { product, size, quantity, meta } = action.payload
      const key       = `${product._id}-${size}`
      const unitPrice = meta?.price ?? product.price

      const existing = state.find((item) => item.key === key)
      if (existing) {
        return state.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [
        ...state,
        {
          key,
          productId: product._id,
          name:      product.name,
          brand:     product.brand || '',
          price:     unitPrice,
          image:     product.images?.[0] || '',
          size,
          quantity,
          maxStock:  99, // pas de gestion de stock → illimité
          meta:      meta || null,
        },
      ]
    }

    case ACTIONS.REMOVE:
      return state.filter((item) => item.key !== action.payload)

    case ACTIONS.UPDATE_QTY:
      return state.map((item) =>
        item.key === action.payload.key
          ? { ...item, quantity: Math.max(1, Math.min(99, action.payload.quantity)) }
          : item
      )

    case ACTIONS.CLEAR:
      return []

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('siow_cart')
      if (stored) dispatch({ type: ACTIONS.LOAD, payload: JSON.parse(stored) })
    } catch { console.warn('Panier localStorage invalide') }
  }, [])

  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem('siow_cart', JSON.stringify(items))
  }, [items])

  const total     = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart      = (product, size, quantity = 1, meta = null) =>
    dispatch({ type: ACTIONS.ADD, payload: { product, size, quantity, meta } })
  const removeFromCart = (key)           => dispatch({ type: ACTIONS.REMOVE,     payload: key })
  const updateQuantity = (key, quantity) => dispatch({ type: ACTIONS.UPDATE_QTY, payload: { key, quantity } })
  const clearCart      = ()              => dispatch({ type: ACTIONS.CLEAR })

  return (
    <CartContext.Provider value={{ items, total, itemCount, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export default CartContext