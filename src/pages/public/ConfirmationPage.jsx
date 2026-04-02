import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { useLanguage } from '../../context/LanguageContext'

function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const { t } = useLanguage()
  const orderId = searchParams.get('orderId')
  const [orderStatus, setOrderStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  // ← scroll vers le haut dès l'affichage
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [])

  useEffect(() => {
    if (orderId) {
      setLoading(true)
      api.get(`/payment/status/${orderId}`)
        .then(({ data }) => setOrderStatus(data))
        .catch(() => setOrderStatus(null))
        .finally(() => setLoading(false))
    }
  }, [orderId])

  const isPaid          = orderStatus?.paymentStatus === 'payé'
  const isFailed        = orderStatus?.paymentStatus === 'échoué'
  const isOnlinePayment = orderStatus?.paymentMethod === 'CIB' || orderStatus?.paymentMethod === 'EDAHABIA'

  return (
    <div className="min-h-screen bg-surface pt-20 flex items-center justify-center px-6 pb-32">
      <div className="max-w-md w-full animate-fade-up">

        {loading ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            <p className="stitch-label">{t.verifyingPayment}</p>
          </div>

        ) : isFailed ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-surface-container flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-error"
                style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                cancel
              </span>
            </div>
            <span className="stitch-label block mb-3">{t.paymentFailed}</span>
            <h1 className="font-headline text-on-surface text-5xl font-bold tracking-tighter mb-4">
              {t.oops}
            </h1>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-10">
              {t.paymentFailedDesc}
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/products" className="btn-primary justify-center">{t.retry}</Link>
              <Link to="/" className="btn-secondary justify-center">{t.homeBtn}</Link>
            </div>
          </div>

        ) : (
          <div className="text-center">
            {/* Icône succès dorée */}
            <div className="w-20 h-20 bg-amber-400/10 border-2 border-amber-400/30
                            flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-amber-400"
                style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
                check_circle
              </span>
            </div>

            <div className="w-10 h-[2px] bg-amber-400 mx-auto mb-6" />

            <span className="stitch-label block mb-3 text-amber-500">{t.orderConfirmed}</span>
            <h1 className="font-headline text-on-surface text-6xl font-bold tracking-tighter mb-4">
              {t.thanks}
            </h1>

            {isOnlinePayment && isPaid && (
              <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-2">
                {t.paymentReceived(orderStatus.paymentMethod)}
              </p>
            )}
            {isOnlinePayment && !isPaid && !isFailed && (
              <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-2">
                {t.paymentPending}
              </p>
            )}

            <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-2">
              {t.orderRegistered}
            </p>
            {!isOnlinePayment && (
              <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                {t.teamWillContact}
              </p>
            )}

            <div className="bg-amber-400/8 border border-amber-400/20 p-5 mt-8 mb-10
                            flex items-start gap-4 text-left">
              <span className="material-symbols-outlined text-amber-400 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>local_shipping</span>
              <div>
                <p className="font-body font-semibold text-on-surface text-sm mb-0.5">
                  {t.estimatedDelivery}
                </p>
                <p className="font-body text-on-surface-variant text-xs">
                  {t.deliveryDays}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/products"
                className="w-full py-4 flex items-center justify-center
                           bg-amber-400 hover:bg-amber-300 text-black font-label
                           text-[0.6875rem] uppercase tracking-[0.2rem] font-bold transition-all">
                {t.continueShoppingBtn}
              </Link>
              <Link to="/" className="btn-secondary justify-center">{t.homeBtn}</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfirmationPage