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

  const isPaid = orderStatus?.paymentStatus === 'payé'
  const isFailed = orderStatus?.paymentStatus === 'échoué'
  const isOnlinePayment = orderStatus?.paymentMethod === 'CIB' || orderStatus?.paymentMethod === 'EDAHABIA'

  return (
    <div className="min-h-screen bg-sf-cream pt-20 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center animate-fade-up">

        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-sf-beige border-t-sf-text rounded-full animate-spin" />
            <p className="font-body text-sf-text-soft">Vérification du paiement...</p>
          </div>

        ) : isFailed ? (
          <>
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">
              ❌
            </div>
            <p className="sf-label mb-3 text-red-400">Paiement échoué</p>
            <h1 className="font-display text-sf-text text-5xl mb-4">Oops !</h1>
            <p className="font-body text-sf-text-soft leading-relaxed mb-8">
              Le paiement n'a pas abouti. Votre commande a été annulée et le stock remis à jour.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary">Réessayer 🛍️</Link>
              <Link to="/" className="btn-secondary">Accueil</Link>
            </div>
          </>

        ) : (
          <>
            <div className="w-24 h-24 bg-sf-rose-soft rounded-full flex items-center
                            justify-center mx-auto mb-8 text-5xl">
              🎉
            </div>

            <p className="sf-label mb-3">Commande confirmée</p>
            <h1 className="font-display text-sf-text text-6xl mb-4">Merci !</h1>

            {isOnlinePayment && isPaid && (
              <p className="font-body text-sf-text-soft leading-relaxed mb-2">
                ✅ Votre paiement par <strong>{orderStatus.paymentMethod}</strong> a bien été reçu.
              </p>
            )}
            {isOnlinePayment && !isPaid && !isFailed && (
              <p className="font-body text-sf-text-soft leading-relaxed mb-2">
                ⏳ Votre paiement est en cours de validation par Chargily.
              </p>
            )}

            <p className="font-body text-sf-text-soft leading-relaxed mb-2">
              Votre commande a bien été enregistrée.
            </p>
            {!isOnlinePayment && (
              <p className="font-body text-sf-text-soft leading-relaxed mb-8">
                Notre équipe vous contactera pour confirmer la livraison.
              </p>
            )}

            <div className="bg-sf-sage-soft rounded-2xl p-6 mb-8 text-left mt-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🚚</span>
                <p className="font-body font-700 text-sf-text">Livraison estimée</p>
              </div>
              <p className="font-body text-sf-text-soft text-sm">2 à 5 jours ouvrables</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary">
                Continuer mes achats 🛍️
              </Link>
              <Link to="/" className="btn-secondary">Accueil</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ConfirmationPage