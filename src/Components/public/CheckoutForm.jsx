import { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import wilayas from '../../data/wilayas'

function CheckoutForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    firstName:     '',
    lastName:      '',
    phone:         '',
    wilaya:        '',
    commune:       '',
    paymentMethod: 'livraison',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Prénom requis'
    if (!form.lastName.trim())  e.lastName  = 'Nom requis'
    if (!form.phone.trim())     e.phone     = 'Téléphone requis'
    else if (!/^(0)(5|6|7)\d{8}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Numéro invalide (ex: 0551234567)'
    if (!form.wilaya)            e.wilaya   = 'Wilaya requise'
    if (!form.commune.trim())    e.commune  = 'Commune requise'
    return e
  }

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev)   => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSubmit(form)
  }

  const paymentOptions = [
    { value: 'livraison', label: 'Paiement à la livraison', desc: 'Cash à la réception', icon: 'local_shipping' },
    { value: 'CIB',       label: 'Carte CIB',               desc: 'Paiement sécurisé',  icon: 'credit_card' },
    { value: 'EDAHABIA',  label: 'Carte Edahabia',           desc: 'Via votre carte',    icon: 'smartphone' },
  ]

  const Field = ({ name, label, placeholder, type = 'text', inputMode, autoComplete, children }) => (
    <div>
      <label className="block stitch-label mb-2">{label}</label>
      {children || (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`sf-input ${errors[name] ? 'border-error' : ''}`}
        />
      )}
      {errors[name] && (
        <p className="mt-1 font-body text-error text-xs">{errors[name]}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <Field name="firstName" label="Prénom" placeholder="Amina"   autoComplete="given-name" />
        <Field name="lastName"  label="Nom"    placeholder="Benali"  autoComplete="family-name" />
      </div>

      <Field name="phone" label="Téléphone" placeholder="0551234567"
             type="tel" inputMode="numeric" autoComplete="tel" />

      {/* Wilaya select */}
      <Field name="wilaya" label="Wilaya">
        <div className="relative">
          <select
            name="wilaya"
            value={form.wilaya}
            onChange={handleChange}
            className={`sf-select w-full border-0 border-b pr-8
                        ${errors.wilaya ? 'border-error' : 'border-outline-variant'}`}
          >
            <option value="">Sélectionner une wilaya</option>
            {wilayas.map((w) => (
              <option key={w.code} value={w.name}>{w.code} — {w.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2
                                             text-outline pointer-events-none" />
        </div>
        {errors.wilaya && <p className="mt-1 font-body text-error text-xs">{errors.wilaya}</p>}
      </Field>

      <Field name="commune" label="Commune" placeholder="Votre commune" autoComplete="address-level2" />

      {/* Payment method */}
      <div>
        <p className="stitch-label mb-4">Mode de paiement</p>
        <div className="space-y-2">
          {paymentOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-all
                          ${form.paymentMethod === opt.value
                            ? 'bg-surface-container-low border border-primary/20'
                            : 'bg-transparent border border-outline-variant/30 hover:border-outline-variant'}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                checked={form.paymentMethod === opt.value}
                onChange={handleChange}
                className="sr-only"
              />
              <span
                className={`material-symbols-outlined text-[20px] flex-shrink-0
                            ${form.paymentMethod === opt.value ? 'text-on-surface' : 'text-outline'}`}
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                {opt.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-body text-sm font-semibold
                               ${form.paymentMethod === opt.value ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {opt.label}
                </p>
                <p className="font-body text-xs text-outline">{opt.desc}</p>
              </div>
              <div className={`w-4 h-4 flex-shrink-0 border flex items-center justify-center
                               ${form.paymentMethod === opt.value ? 'border-primary' : 'border-outline-variant'}`}>
                {form.paymentMethod === opt.value && (
                  <div className="w-2 h-2 bg-primary" />
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {(form.paymentMethod === 'CIB' || form.paymentMethod === 'EDAHABIA') && (
        <div className="bg-surface-container-low p-4">
          <p className="font-body text-xs text-on-surface-variant">
            Vous serez redirigé vers la plateforme sécurisée <strong>Chargily ePay</strong> pour
            finaliser votre paiement.
          </p>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full py-4 justify-center">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
            Traitement...
          </span>
        ) : form.paymentMethod === 'livraison'
            ? 'Confirmer la commande'
            : 'Payer maintenant'}
      </button>
    </form>
  )
}

export default CheckoutForm
