import { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { wilayas } from '../../data/wilayas'
import { useLanguage } from '../../context/LanguageContext'

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
        <Field name="firstName" label={t.firstName} placeholder="Amina"  autoComplete="given-name" />
        <Field name="lastName"  label={t.lastName}  placeholder="Benali" autoComplete="family-name" />
      </div>

      <Field name="phone" label={t.phone} placeholder="0551234567"
             type="tel" inputMode="numeric" autoComplete="tel" />

      {/* Wilaya selector */}
      <Field name="wilaya" label={t.wilaya}>
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
          <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2
                                             text-outline pointer-events-none" />
        </div>
        {errors.wilaya && <p className="mt-1 font-body text-error text-xs">{errors.wilaya}</p>}
      </Field>

      <Field name="commune" label={t.commune} placeholder={t.communePlaceholder} autoComplete="address-level2" />

      {/* Paiement à la livraison — seul mode disponible */}
      <div className="flex items-center gap-3 p-4 bg-surface-container-low border border-primary/20">
        <span
          className="material-symbols-outlined text-[20px] text-on-surface flex-shrink-0"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
        >
          local_shipping
        </span>
        <div className="flex-1">
          <p className="font-body text-sm font-semibold text-on-surface">{t.payDelivery}</p>
          <p className="font-body text-xs text-outline">{t.payDeliveryDesc}</p>
        </div>
        <div className="w-4 h-4 border border-primary flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-2 bg-primary" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-4 justify-center">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
            {t.processing}
          </span>
        ) : t.confirmOrder}
      </button>
    </form>
  )
}

export default CheckoutForm