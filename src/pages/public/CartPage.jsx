import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import CartItem from '../../Components/public/CartItem'
import CheckoutForm from '../../Components/public/CheckoutForm'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'

// ─── Modal de confirmation avant commande ─────────────────────────────────────
function ConfirmOrderModal({ formData, total, onConfirm, onCancel, submitting, t }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white w-full max-w-sm animate-fade-up shadow-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-amber-400/15 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-amber-500 text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>fact_check</span>
            </div>
            <h2 className="font-headline text-on-surface text-lg font-bold tracking-tight">
              {t.confirmModalTitle}
            </h2>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Vos informations */}
          <div className="space-y-2">
            <p className="font-label text-[0.6rem] uppercase tracking-[0.15rem] text-amber-500">
              {t.confirmModalYourInfo}
            </p>
            <div className="bg-surface-container-low p-4 space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Nom</span>
                <span className="text-on-surface font-semibold">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Téléphone</span>
                <span className="text-on-surface font-semibold">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Wilaya</span>
                <span className="text-on-surface font-semibold">{formData.wilaya}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Commune</span>
                <span className="text-on-surface font-semibold">{formData.commune}</span>
              </div>
              <div className="pt-2 border-t border-outline-variant/30 flex justify-between">
                <span className="text-on-surface-variant">Total</span>
                <span className="text-amber-500 font-bold font-headline text-base">
                  {total.toLocaleString('fr-DZ')} DZD
                </span>
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 p-4">
            <span className="material-symbols-outlined text-red-500 text-[18px] flex-shrink-0 mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>warning</span>
            <p className="font-body text-xs text-red-700 leading-relaxed">
              {t.confirmModalWarning}
            </p>
          </div>

          {/* Boutons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={onConfirm}
              disabled={submitting}
              className="w-full py-3.5 flex items-center justify-center gap-2
                         bg-amber-400 hover:bg-amber-300 active:scale-[0.98]
                         text-black font-label text-[0.6875rem] uppercase tracking-[0.2rem]
                         font-bold transition-all disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  {t.processing}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
                  {t.confirmOrder}
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={submitting}
              className="w-full py-3 text-on-surface-variant hover:text-on-surface
                         font-label text-[0.6875rem] uppercase tracking-[0.15rem]
                         transition-colors border border-outline-variant/30
                         hover:border-outline-variant"
            >
              {t.confirmModalEdit}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page panier ──────────────────────────────────────────────────────────────
function CartPage() {
  const { items, total, clearCart } = useCart()
  const navigate    = useNavigate()
  const { t }       = useLanguage()
  const [submitting, setSubmitting]     = useState(false)
  const [pendingForm, setPendingForm]   = useState(null) // données en attente de confirmation

  // Étape 1 : CheckoutForm soumet → on ouvre la modale au lieu de commander directement
  const handleFormSubmit = (formData) => {
    setPendingForm(formData)
  }

  // Étape 2 : client confirme dans la modale → on passe la commande
  const handleConfirmedOrder = async () => {
    if (!pendingForm) return
    if (items.length === 0) { toast.error(t.toastEmptyCart); return }
    setSubmitting(true)

    const { paymentMethod, ...shippingInfo } = pendingForm
    const orderItems = items.map((item) => ({
      product: item.productId, name: item.name, size: item.size,
      quantity: item.quantity, price: item.price,
    }))

    try {
      await api.post('/orders', { customerInfo: shippingInfo, items: orderItems, total })
      clearCart()
      setPendingForm(null)
      navigate('/confirmation', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || t.toastOrderError)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Empty state ────────────────────────────────────────────── */
  if (items.length === 0) return (
    <div className="min-h-screen bg-surface pt-20 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-20 h-20 bg-surface-container flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-outline text-4xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}>shopping_bag</span>
        </div>
        <h2 className="font-headline text-on-surface text-3xl lg:text-4xl font-bold
                       tracking-tighter mb-3">{t.emptyCart}</h2>
        <p className="stitch-label mb-10">{t.emptyCartSub}</p>
        <Link to="/products" className="btn-primary">{t.discoverCatalog ?? t.discoverAtelier}</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface pt-16 lg:pt-28">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-surface-container-low pt-10 pb-10 px-6 lg:px-16 xl:px-24">
        <div className="max-w-screen-xl mx-auto">
          <button onClick={() => navigate('/products')}
            className="flex items-center gap-2 stitch-label hover:text-amber-500
                       transition-colors mb-6 group">
            <span className="material-symbols-outlined text-[16px]
                             group-hover:-translate-x-1 transition-transform"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>arrow_back</span>
            {t.continueShopping}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-amber-400" />
            <h1 className="font-headline text-on-surface text-4xl lg:text-6xl font-bold tracking-tighter">
              {t.myCart}
            </h1>
          </div>
          <p className="stitch-label mt-2 ml-11">{t.cartArticleCount(items.length)}</p>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 py-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-16">

          {/* Articles */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center justify-end mb-4">
              <button onClick={clearCart}
                className="stitch-label hover:text-error transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>delete_sweep</span>
                {t.clearCart}
              </button>
            </div>
            {items.map((item) => <CartItem key={item.key} item={item} />)}
          </div>

          {/* Summary + form */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-36 space-y-4">

              {/* Total */}
              <div className="bg-surface-container-lowest p-6 lg:p-8 shadow-ambient">
                <p className="stitch-label mb-5">{t.summary}</p>
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
                  <span className="stitch-label">{t.total}</span>
                  <div className="text-right">
                    <span className="font-headline text-amber-500 text-2xl lg:text-3xl font-bold">
                      {total.toLocaleString('fr-DZ')}
                    </span>
                    <span className="text-on-surface-variant text-sm font-body ml-1">DZD</span>
                  </div>
                </div>
              </div>

              {/* Checkout form */}
              <div className="bg-surface-container-lowest p-6 lg:p-8 shadow-ambient">
                <p className="stitch-label mb-6">{t.shippingInfo}</p>
                <CheckoutForm onSubmit={handleFormSubmit} loading={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modale de confirmation ───────────────────────────────── */}
      {pendingForm && (
        <ConfirmOrderModal
          formData={pendingForm}
          total={total}
          onConfirm={handleConfirmedOrder}
          onCancel={() => setPendingForm(null)}
          submitting={submitting}
          t={t}
        />
      )}
    </div>
  )
}

export default CartPage