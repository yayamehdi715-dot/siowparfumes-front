import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import CartItem from '../../Components/public/CartItem'
import CheckoutForm from '../../Components/public/CheckoutForm'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

function CartPage() {
  const { items, total, clearCart } = useCart()
  const navigate    = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const handleOrder = async (customerInfo) => {
    if (items.length === 0) { toast.error('Votre panier est vide'); return }
    setSubmitting(true)

    const { paymentMethod, ...shippingInfo } = customerInfo
    const orderItems = items.map((item) => ({
      product:  item.productId,
      name:     item.name,
      size:     item.size,
      quantity: item.quantity,
      price:    item.price,
    }))

    try {
      if (paymentMethod === 'livraison') {
        await api.post('/orders', { customerInfo: shippingInfo, items: orderItems, total })
        clearCart()
        navigate('/confirmation', { replace: true })
      } else {
        const { data } = await api.post('/payment/create', {
          customerInfo: shippingInfo,
          items: orderItems,
          total,
          paymentMode: paymentMethod,
        })
        if (data.checkout_url) {
          clearCart()
          window.location.href = data.checkout_url
        } else {
          toast.error("Impossible d'obtenir l'URL de paiement.")
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Empty state ──────────────────────────────────────────────── */
  if (items.length === 0) return (
    <div className="min-h-screen bg-surface pt-20 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-20 h-20 bg-surface-container flex items-center justify-center mx-auto mb-8">
          <span
            className="material-symbols-outlined text-outline text-4xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}
          >
            shopping_bag
          </span>
        </div>
        <h2 className="font-headline text-on-surface text-3xl font-bold tracking-tighter mb-3">
          Panier vide
        </h2>
        <p className="stitch-label mb-10">Découvrez notre sélection</p>
        <Link to="/products" className="btn-primary">
          Découvrir le catalogue
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface pt-16">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="bg-surface-container-low pt-10 pb-10 px-6">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 stitch-label hover:text-on-surface transition-colors mb-6 group"
        >
          <span
            className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
          >
            arrow_back
          </span>
          Continuer les achats
        </button>
        <h1 className="font-headline text-on-surface text-4xl font-bold tracking-tighter">
          Mon Panier
        </h1>
        <p className="stitch-label mt-2">
          {items.length} article{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Articles list */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={clearCart}
                className="stitch-label hover:text-error transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                  delete_sweep
                </span>
                Vider le panier
              </button>
            </div>
            {items.map((item) => <CartItem key={item.key} item={item} />)}
          </div>

          {/* Summary + checkout */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">

              {/* Total */}
              <div className="bg-surface-container-lowest p-6 shadow-ambient">
                <p className="stitch-label mb-5">Récapitulatif</p>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.key} className="flex justify-between text-sm font-body">
                      <span className="text-on-surface-variant truncate mr-4 flex-1">
                        {item.name} ×{item.quantity}
                      </span>
                      <span className="text-on-surface whitespace-nowrap font-semibold">
                        {(item.price * item.quantity).toLocaleString('fr-DZ')} DZD
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-surface-container-high mb-5" />
                <div className="flex justify-between items-baseline">
                  <span className="stitch-label">Total</span>
                  <span className="font-headline text-secondary text-2xl font-bold">
                    {total.toLocaleString('fr-DZ')} DZD
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="bg-surface-container-lowest p-6 shadow-ambient">
                <p className="stitch-label mb-6">Informations de livraison</p>
                <CheckoutForm onSubmit={handleOrder} loading={submitting} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
