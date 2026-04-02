import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'

const NAV_CATEGORIES = [
  { label: 'Watches',     slug: 'Watches' },
  { label: 'Fragrances',  slug: 'Fragrances' },
  { label: 'Saudi Coll.', slug: 'Saudi Coll.' },
  { label: 'Essentials',  slug: 'Essentials' },
]

function Navbar() {
  const { itemCount } = useCart()
  const navigate      = useNavigate()
  const location      = useLocation()
  const { lang, toggleLang, t } = useLanguage()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal]   = useState('')
  const [scrolled, setScrolled]     = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal)}`)
      setSearchOpen(false)
      setSearchVal('')
    }
  }

  const path       = location.pathname
  const isHome     = path === '/'
  const isCatalog  = path.startsWith('/products') || path.startsWith('/tag')
  const isCart     = path === '/cart'
  const isAbout    = path === '/about'

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300
        ${scrolled ? 'bg-[#F9F9F9]/95 shadow-ambient' : 'bg-[#F9F9F9]/80'}
        backdrop-blur-xl`}>

        {/* ── MOBILE top row ──────────────────────────────────── */}
        <div className="lg:hidden flex justify-between items-center px-6 py-4">
          {/* Search toggle */}
          <div>
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="bg-surface-container text-on-surface font-body text-sm
                             px-3 py-1.5 outline-none w-40 border-b border-primary"
                />
                <button type="button" onClick={() => { setSearchOpen(false); setSearchVal('') }}>
                  <span className="material-symbols-outlined text-[20px] text-on-surface"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>close</span>
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)}
                className="cursor-pointer active:scale-95 transition-transform text-on-surface">
                <span className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>search</span>
              </button>
            )}
          </div>

          <Link to="/">
            <h1 className="text-xl font-headline italic tracking-tighter text-on-surface">
              SIOW PARFUMES
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            {/* Language toggle mobile */}
            <button onClick={toggleLang}
              className="font-label text-[0.6rem] uppercase tracking-[0.1rem] text-on-surface-variant
                         hover:text-on-surface transition-colors border border-outline-variant px-1.5 py-0.5">
              {lang === 'ar' ? 'FR' : 'AR'}
            </button>
            <button onClick={() => navigate('/cart')}
              className="relative cursor-pointer active:scale-95 transition-transform text-on-surface">
              <span className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>shopping_bag</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-secondary text-on-secondary
                                 text-[9px] font-bold flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── DESKTOP top bar ─────────────────────────────────── */}
        <div className="hidden lg:flex flex-col">
          {/* Main row */}
          <div className="flex justify-between items-center px-10 xl:px-16 py-4">
            {/* Left: search */}
            <div className="flex items-center gap-6 w-64">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="bg-surface-container text-on-surface font-body text-sm
                               px-3 py-1.5 outline-none border-b border-primary flex-1"
                  />
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchVal('') }}>
                    <span className="material-symbols-outlined text-[18px] text-on-surface"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>close</span>
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface
                             transition-colors group">
                  <span className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>search</span>
                  <span className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]">
                    {t.search}
                  </span>
                </button>
              )}
            </div>

            {/* Center: logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-2xl font-headline italic tracking-tighter text-on-surface
                             hover:text-secondary transition-colors duration-300">
                SIOW PARFUMES
              </h1>
            </Link>

            {/* Right: lang toggle + cart + about */}
            <div className="flex items-center gap-6 w-64 justify-end">
              {/* Language toggle desktop */}
              <button onClick={toggleLang}
                className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]
                           text-on-surface-variant hover:text-on-surface transition-colors
                           border border-outline-variant px-2 py-1">
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
              <Link to="/about"
                className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]
                           text-on-surface-variant hover:text-on-surface transition-colors">
                {t.about}
              </Link>
              <button onClick={() => navigate('/cart')}
                className="relative flex items-center gap-2 text-on-surface-variant
                           hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>shopping_bag</span>
                {itemCount > 0 && (
                  <>
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-secondary text-on-secondary
                                     text-[9px] font-bold flex items-center justify-center rounded-full">
                      {itemCount}
                    </span>
                    <span className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]">
                      {t.cartWithCount(itemCount)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category nav row */}
          <div className="flex justify-center items-center gap-10 pb-3 border-t border-outline-variant/20 pt-3">
            {NAV_CATEGORIES.map(({ label, slug }) => (
              <Link key={slug} to={`/products?category=${slug}`}
                className={`font-label text-[0.6875rem] uppercase tracking-[0.2rem] transition-colors
                            relative group pb-1
                            ${location.search.includes(slug)
                              ? 'text-on-surface after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-primary'
                              : 'text-on-surface-variant hover:text-on-surface'}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="bg-surface-container-low h-[1px] w-full" />
      </header>

      {/* ── Bottom Nav (mobile only) ────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center
                      px-4 pb-8 pt-2 bg-[#F9F9F9]/92 backdrop-blur-2xl
                      border-t border-black/5">
        {[
          { to: '/',        icon: 'home',         label: t.home,     active: isHome },
          { to: '/products',icon: 'menu_book',     label: t.catalog,  active: isCatalog },
          { to: '/cart',    icon: 'shopping_bag',  label: t.cartLabel, active: isCart, badge: itemCount },
          { to: '/about',   icon: 'info',          label: t.aboutLabel, active: isAbout },
        ].map(({ to, icon, label, active, badge }) => (
          <Link key={to} to={to}
            className={`flex flex-col items-center justify-center pt-2 transition-all duration-300 relative
              ${active
                ? 'text-on-surface font-bold border-t-2 border-on-surface'
                : 'text-outline hover:text-on-surface'}`}>
            <span className="material-symbols-outlined mb-1 text-[22px]"
              style={{ fontVariationSettings: active ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 200" }}>
              {icon}
            </span>
            {badge > 0 && (
              <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-secondary text-on-secondary
                               text-[8px] font-bold flex items-center justify-center rounded-full">
                {badge}
              </span>
            )}
            <span className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

export default Navbar