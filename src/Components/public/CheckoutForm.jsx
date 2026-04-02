import { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { wilayas } from '../../data/wilayas'
import { useLanguage } from '../../context/LanguageContext'

// ─── IMPORTANT : Field est HORS du composant ──────────────────────────────────
// Si Field était défini à l'intérieur, React le recrée à chaque frappe,
// démonte l'input et le focus est perdu → un seul caractère saisi à la fois.
// ─────────────────────────────────────────────────────────────────────────────
function Field({ name, label, placeholder, type = 'text', inputMode, autoComplete,
                 value, onChange, error, children }) {
  return (
    <div>
      <label className="block stitch-label mb-2 text-on-surface-variant">{label}</label>
      {children || (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`sf-input ${error ? 'border-error' : ''}`}
        />
      )}
      {error && <p className="mt-1 font-body text-error text-xs">{error}</p>}
    </div>
  )
}

function CheckoutForm({ onSubmit, loading }) {
  const { t } = useLanguage()
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
    if (!form.firstName.trim()) e.firstName = t.errFirstName
    if (!form.lastName.trim())  e.lastName  = t.errLastName
    if (!form.phone.trim())     e.phone     = t.errPhone
    else if (!/^(0)(5|6|7)\d{8}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = t.errPhoneInvalid
    if (!form.wilaya)            e.wilaya   = t.errWilaya
    if (!form.commune.trim())    e.commune  = t.errCommune
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* Nom */}
      <div className="grid grid-cols-2 gap-4">
        <Field name="firstName" label={t.firstName} placeholder="Amina"
               value={form.firstName} onChange={handleChange} error={errors.firstName}
               autoComplete="given-name" />
        <Field name="lastName"  label={t.lastName}  placeholder="Benali"
               value={form.lastName}  onChange={handleChange} error={errors.lastName}
               autoComplete="family-name" />
      </div>

      {/* Téléphone */}
      <Field name="phone" label={t.phone} placeholder="0551234567"
             value={form.phone} onChange={handleChange} error={errors.phone}
             type="tel" inputMode="numeric" autoComplete="tel" />

      {/* Wilaya */}
      <div>
        <label className="block stitch-label mb-2 text-on-surface-variant">{t.wilaya}</label>
        <div className="relative">
          <select
            name="wilaya"
            value={form.wilaya}
            onChange={handleChange}
            className={`sf-input appearance-none pr-8 w-full ${errors.wilaya ? 'border-error' : ''}`}
          >
            <option value="">{t.selectWilaya}</option>
            {wilayas.map((w) => (
              <option key={w.code} value={w.name}>{w.code} — {w.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
                                             text-outline pointer-events-none" />
        </div>
        {errors.wilaya && <p className="mt-1 font-body text-error text-xs">{errors.wilaya}</p>}
      </div>

      {/* Commune */}
      <Field name="commune" label={t.commune} placeholder={t.communePlaceholder}
             value={form.commune} onChange={handleChange} error={errors.commune}
             autoComplete="address-level2" />

      {/* Paiement à la livraison */}
      <div className="flex items-center gap-4 p-4 bg-amber-400/8 border border-amber-400/25">
        <div className="w-10 h-10 bg-amber-400/15 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-amber-400 text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>local_shipping</span>
        </div>
        <div className="flex-1">
          <p className="font-body text-sm font-semibold text-on-surface">{t.payDelivery}</p>
          <p className="font-body text-xs text-on-surface-variant">{t.payDeliveryDesc}</p>
        </div>
        <div className="w-4 h-4 border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-2 bg-amber-400" />
        </div>
      </div>

      {/* Bouton confirmer */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 flex items-center justify-center gap-2
                   bg-amber-400 hover:bg-amber-300 active:scale-[0.98]
                   text-black font-label text-[0.6875rem] uppercase tracking-[0.2rem]
                   font-bold transition-all duration-200 disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            {t.processing}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
            {t.confirmOrder}
          </>
        )}
      </button>
    </form>
  )
}

export default CheckoutForm