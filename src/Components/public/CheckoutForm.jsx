import { useState, useCallback } from 'react'
import { ChevronDown, CreditCard, Truck, Smartphone } from 'lucide-react'
import wilayas from '../../data/wilayas'

function CheckoutForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    wilaya: '',
    commune: '',
    paymentMethod: 'livraison', // 'livraison' | 'CIB' | 'EDAHABIA'
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Prénom requis'
    if (!form.lastName.trim()) e.lastName = 'Nom requis'
    if (!form.phone.trim()) e.phone = 'Téléphone requis'
    else if (!/^(0)(5|6|7)\d{8}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Numéro invalide (ex: 0551234567)'
    if (!form.wilaya) e.wilaya = 'Wilaya requise'
    if (!form.commune.trim()) e.commune = 'Commune requise'
    return e
  }

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSubmit(form)
  }

  const paymentOptions = [
    {
      value: 'livraison',
      label: 'Paiement à la livraison',
      desc: 'Payez en cash à la réception',
      icon: <Truck size={18} />,
    },
    {
      value: 'CIB',
      label: 'Carte CIB',
      desc: 'Paiement sécurisé par carte bancaire',
      icon: <CreditCard size={18} />,
    },
    {
      value: 'EDAHABIA',
      label: 'Carte EDAHABIA',
      desc: 'Paiement via votre carte Edahabia',
      icon: <Smartphone size={18} />,
    },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-body text-sf-text-soft text-xs font-600
                             uppercase tracking-wider mb-2">Prénom</label>
          <input type="text" name="firstName" value={form.firstName}
            onChange={handleChange} placeholder="Amina" autoComplete="given-name"
            className={`sf-input ${errors.firstName ? 'border-red-300 ring-2 ring-red-100' : ''}`} />
          {errors.firstName && <p className="mt-1 text-red-400 text-xs">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block font-body text-sf-text-soft text-xs font-600
                             uppercase tracking-wider mb-2">Nom</label>
          <input type="text" name="lastName" value={form.lastName}
            onChange={handleChange} placeholder="Benali" autoComplete="family-name"
            className={`sf-input ${errors.lastName ? 'border-red-300 ring-2 ring-red-100' : ''}`} />
          {errors.lastName && <p className="mt-1 text-red-400 text-xs">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block font-body text-sf-text-soft text-xs font-600
                           uppercase tracking-wider mb-2">Téléphone</label>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange}
          placeholder="0551234567" autoComplete="tel" inputMode="numeric"
          className={`sf-input ${errors.phone ? 'border-red-300 ring-2 ring-red-100' : ''}`} />
        {errors.phone && <p className="mt-1 text-red-400 text-xs">{errors.phone}</p>}
      </div>

      <div>
        <label className="block font-body text-sf-text-soft text-xs font-600
                           uppercase tracking-wider mb-2">Wilaya</label>
        <div className="relative">
          <select name="wilaya" value={form.wilaya} onChange={handleChange}
            className={`sf-select ${errors.wilaya ? 'border-red-300 ring-2 ring-red-100' : ''}`}>
            <option value="">Sélectionner une wilaya</option>
            {wilayas.map((w) => (
              <option key={w.code} value={w.name}>{w.code} — {w.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2
                                            text-sf-text-soft pointer-events-none" />
        </div>
        {errors.wilaya && <p className="mt-1 text-red-400 text-xs">{errors.wilaya}</p>}
      </div>

      <div>
        <label className="block font-body text-sf-text-soft text-xs font-600
                           uppercase tracking-wider mb-2">Commune</label>
        <input type="text" name="commune" value={form.commune} onChange={handleChange}
          placeholder="Votre commune" autoComplete="address-level2"
          className={`sf-input ${errors.commune ? 'border-red-300 ring-2 ring-red-100' : ''}`} />
        {errors.commune && <p className="mt-1 text-red-400 text-xs">{errors.commune}</p>}
      </div>

      {/* Mode de paiement */}
      <div>
        <label className="block font-body text-sf-text-soft text-xs font-600
                           uppercase tracking-wider mb-3">Mode de paiement</label>
        <div className="space-y-2">
          {paymentOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                ${form.paymentMethod === opt.value
                  ? 'border-sf-text bg-sf-rose-soft/30'
                  : 'border-sf-beige hover:border-sf-beige-dark'
                }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                checked={form.paymentMethod === opt.value}
                onChange={handleChange}
                className="sr-only"
              />
              <span className={`flex-shrink-0 ${form.paymentMethod === opt.value ? 'text-sf-text' : 'text-sf-text-soft'}`}>
                {opt.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-body text-sm font-600 ${form.paymentMethod === opt.value ? 'text-sf-text' : 'text-sf-text-soft'}`}>
                  {opt.label}
                </p>
                <p className="font-body text-xs text-sf-text-light">{opt.desc}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                ${form.paymentMethod === opt.value ? 'border-sf-text' : 'border-sf-beige-dark'}`}>
                {form.paymentMethod === opt.value && (
                  <div className="w-2 h-2 rounded-full bg-sf-text" />
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {(form.paymentMethod === 'CIB' || form.paymentMethod === 'EDAHABIA') && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-xs font-body text-blue-600">
            🔒 Vous serez redirigé vers la plateforme sécurisée <strong>Chargily ePay</strong> pour finaliser votre paiement.
          </p>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-4">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-sf-text/20 border-t-sf-text
                             rounded-full animate-spin" />
            Traitement...
          </span>
        ) : form.paymentMethod === 'livraison'
            ? '🛍️ Confirmer la commande'
            : '💳 Payer maintenant'}
      </button>
    </form>
  )
}

export default CheckoutForm