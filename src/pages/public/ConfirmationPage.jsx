import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../utils/api'

function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [orderStatus, setOrderStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (orderId) {
      setLoading(true)
      api.get(`/payment/status/${orderId}`)
        .then(({ data }) => setOrderStatus(data))
        .catch(() => setOrderStatus(null))
        .finally(() => setLoading(false))
    }
  }, [orderId])

  const isPaid           = orderStatus?.paymentStatus === 'payé'
  const isFailed         = orderStatus?.paymentStatus === 'échoué'
  const isOnlinePayment  = orderStatus?.paymentMethod === 'CIB' || orderStatus?.paymentMethod === 'EDAHABIA'

  return (
    <div className="min-h-screen bg-surface pt-20 flex items-center justify-center px-6 pb-32">
      <div className="max-w-md w-full animate-fade-up">

        {loading ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-8 h-8 border border-outline-variant border-t-primary rounded-full animate-spin" />
            <p className="stitch-label">Vérification du paiement...</p>
          </div>

        ) : isFailed ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-surface-container flex items-center justify-center mx-auto mb-8">
              <span
                className="material-symbols-outlined text-error"
                style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                cancel
              </span>
            </div>
            <span className="stitch-label-secondary block mb-3">Paiement échoué</span>
            <h1 className="font-headline text-on-surface text-5xl font-bold tracking-tighter mb-4">
              Oops !
            </h1>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-10">
              Le paiement n'a pas abouti. Votre commande a été annulée.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/products" className="btn-primary justify-center">Réessayer</Link>
              <Link to="/" className="btn-secondary justify-center">Accueil</Link>
            </div>
          </div>

        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-surface-container-low flex items-center justify-center mx-auto mb-8">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                check_circle
              </span>
            </div>

            <span className="stitch-label block mb-3">Commande confirmée</span>
            <h1 className="font-headline text-on-surface text-6xl font-bold tracking-tighter mb-4">
              Merci !
            </h1>

            {isOnlinePayment && isPaid && (
              <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-2">
                Votre paiement par <strong>{orderStatus.paymentMethod}</strong> a bien été reçu.
              </p>
            )}
            {isOnlinePayment && !isPaid && !isFailed && (
              <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-2">
                Votre paiement est en cours de validation.
              </p>
            )}

            <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-2">
              Votre commande a bien été enregistrée.
            </p>
            {!isOnlinePayment && (
              <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                Notre équipe vous contactera pour confirmer la livraison.
              </p>
            )}

            <div className="bg-surface-container-low p-5 mt-8 mb-10 flex items-start gap-4 text-left">
              <span
                className="material-symbols-outlined text-on-surface-variant mt-0.5"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                local_shipping
              </span>
              <div>
                <p className="font-body font-semibold text-on-surface text-sm mb-0.5">
                  Livraison estimée
                </p>
                <p className="font-body text-on-surface-variant text-xs">
                  2 à 5 jours ouvrables · Paiement à la livraison
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/products" className="btn-primary justify-center">Continuer les achats</Link>
              <Link to="/" className="btn-secondary justify-center">Accueil</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfirmationPage
