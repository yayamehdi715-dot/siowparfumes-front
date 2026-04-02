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

  return (
    <footer className="bg-primary text-on-primary pt-20 pb-40 px-6">

      <div className="mb-16">
        <h2 className="text-3xl font-headline italic tracking-tighter mb-4">SIOW PARFUMES</h2>
        <p className="text-white/50 text-[0.6875rem] uppercase tracking-[0.1rem] leading-loose max-w-xs">
          {t.footerTagline}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-16">

        <div className="space-y-6">
          <h4 className="text-[0.6875rem] uppercase tracking-[0.2rem] font-bold">{t.navigation}</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link to="/" className="hover:text-white transition-colors">{t.home}</Link></li>
            <li><Link to="/products" className="hover:text-white transition-colors">{t.catalog}</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">{t.about}</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">{t.cartLabel}</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-[0.6875rem] uppercase tracking-[0.2rem] font-bold">{t.categories}</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link to="/products?category=Watches"     className="hover:text-white transition-colors">Watches</Link></li>
            <li><Link to="/products?category=Fragrances"  className="hover:text-white transition-colors">Fragrances</Link></li>
            <li><Link to="/products?category=Saudi Coll." className="hover:text-white transition-colors">Saudi Coll.</Link></li>
            <li><Link to="/products?category=Essentials"  className="hover:text-white transition-colors">Essentials</Link></li>
          </ul>
        </div>
      </div>

      <div className="space-y-6 mb-16">
        <h4 className="text-[0.6875rem] uppercase tracking-[0.2rem] font-bold">{t.contact}</h4>
        <div className="space-y-2 text-sm text-white/70">
          <p>{t.deliveryInfo}</p>
          <p>{t.paymentInfo}</p>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 flex justify-between items-center
                      text-[10px] uppercase tracking-[0.1rem] text-white/30">
        <p className="flex items-center gap-1">
          <AdminSecretAccess />
          {' '}{new Date().getFullYear()} SIOW PARFUMES
        </p>
        <div className="flex gap-4">
          <span>Instagram</span>
          <span>Facebook</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer