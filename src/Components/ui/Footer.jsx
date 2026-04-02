import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

function AdminSecretAccess() {
  const [clicks, setClicks] = useState(0)
  const [showInput, setShowInput] = useState(false)
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const handleClick = () => {
    const next = clicks + 1
    setClicks(next)
    if (next >= 3) { setShowInput(true); setClicks(0) }
  }

  const handleChange = (e) => {
    const val = e.target.value
    setValue(val)
    if (val.toLowerCase() === 'admin') {
      setShowInput(false); setValue(''); navigate('/admin/login')
    }
  }

  return (
    <div className="relative inline-block">
      <span onClick={handleClick} className="text-white/20 text-xs cursor-default select-none">©</span>
      {showInput && (
        <input
          autoFocus type="text" value={value} onChange={handleChange}
          onBlur={() => { setShowInput(false); setValue(''); setClicks(0) }}
          className="absolute bottom-6 right-0 w-24 bg-surface-container text-on-surface text-xs
                     font-body px-2 py-1 outline-none shadow-float"
          placeholder="..."
        />
      )}
    </div>
  )
}

function Footer() {
  const { t } = useLanguage()
  const [logoError, setLogoError] = useState(false)

  return (
    <footer className="bg-primary text-on-primary pt-20 pb-40 px-6">

      {/* Logo + tagline */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-5">
          {/* Logo avec fond blanc doux pour assurer la visibilité */}
          {!logoError && (
            <div className="bg-white/10 p-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="SIOW PARFUMES"
                className="h-10 w-auto object-contain"
                onError={() => setLogoError(true)}
                style={{ maxWidth: '120px' }}
              />
            </div>
          )}
          <span className="text-2xl font-headline italic tracking-tighter text-white leading-none">
            SIOW PARFUMES
          </span>
        </div>

        {/* Ligne décorative dorée */}
        <div className="w-10 h-[2px] bg-amber-400/60 mb-4" />

        <p className="text-white/50 text-[0.6875rem] uppercase tracking-[0.1rem] leading-loose max-w-xs">
          {t.footerTagline}
        </p>
      </div>

      {/* Navigation + Categories */}
      <div className="grid grid-cols-2 gap-12 mb-16">
        <div className="space-y-6">
          <h4 className="text-[0.6875rem] uppercase tracking-[0.2rem] font-bold text-amber-400/80">
            {t.navigation}
          </h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li><Link to="/"         className="hover:text-amber-400 transition-colors">{t.home}</Link></li>
            <li><Link to="/products" className="hover:text-amber-400 transition-colors">{t.catalog}</Link></li>
            <li><Link to="/cart"     className="hover:text-amber-400 transition-colors">{t.cartLabel}</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-[0.6875rem] uppercase tracking-[0.2rem] font-bold text-amber-400/80">
            {t.categories}
          </h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li><Link to="/products?category=Watches"     className="hover:text-amber-400 transition-colors">{t.categoryLabels?.['Watches']     ?? 'Watches'}</Link></li>
            <li><Link to="/products?category=Fragrances"  className="hover:text-amber-400 transition-colors">{t.categoryLabels?.['Fragrances']  ?? 'Fragrances'}</Link></li>
            <li><Link to="/products?category=Saudi Coll." className="hover:text-amber-400 transition-colors">{t.categoryLabels?.['Saudi Coll.'] ?? 'Saudi Coll.'}</Link></li>
            <li><Link to="/products?category=Essentials"  className="hover:text-amber-400 transition-colors">{t.categoryLabels?.['Essentials']  ?? 'Essentials'}</Link></li>
          </ul>
        </div>
      </div>

      {/* Livraison + paiement */}
      <div className="space-y-6 mb-16">
        <h4 className="text-[0.6875rem] uppercase tracking-[0.2rem] font-bold text-amber-400/80">
          {t.contact}
        </h4>
        <div className="space-y-2 text-sm text-white/60">
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 flex-shrink-0" />
            {t.deliveryInfo}
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 flex-shrink-0" />
            {t.paymentInfo}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-white/10 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1rem] text-white/30">
          <AdminSecretAccess />
          {' '}{new Date().getFullYear()} SIOW PARFUMES
        </p>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/siowparfumes/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/40 hover:text-amber-400 transition-colors
                     text-[10px] uppercase tracking-[0.1rem]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          Instagram
        </a>
      </div>

      {/* CvkDev credit */}
      <div className="mt-6 text-center">
        <a
          href="https://www.instagram.com/cvkdev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/20 hover:text-amber-400/60 transition-colors
                     text-[9px] uppercase tracking-[0.15rem] font-label"
        >
          Developed by CvkDev
        </a>
      </div>
    </footer>
  )
}

export default Footer