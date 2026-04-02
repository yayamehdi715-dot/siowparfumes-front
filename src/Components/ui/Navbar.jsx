import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

function Navbar() {
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal)}`)
      setSearchOpen(false)
      setSearchVal('')
    }
  }

  // Determine active nav tab
  const path = location.pathname
  const isHome     = path === '/'
  const isCatalog  = path.startsWith('/products') || path.startsWith('/tag')
  const isCart     = path === '/cart'
  const isAbout    = path === '/about'

  return (
    <>
      {/* ── Top App Bar ─────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-[#F9F9F9]/80 backdrop-blur-xl">
        <div className="flex justify-between items-center px-6 py-4 w-full">

          {/* Search */}
          <div>
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Rechercher..."
                  className="bg-surface-container text-on-surface font-body text-sm
                             px-4 py-2 outline-none w-44 border-b border-primary"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchVal('') }}
                  className="material-symbols-outlined text-on-surface text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24" }}
                >
                  close
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="cursor-pointer active:scale-95 transition-transform text-on-surface"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24" }}
                >
                  search
                </span>
              </button>
            )}
          </div>

          {/* Logo */}
          <Link to="/">
            <h1 className="text-xl font-headline italic tracking-tighter text-on-surface">
              SIOW PARFUMES
            </h1>
          </Link>

          {/* Cart */}
          <button
            onClick={() => navigate('/cart')}
            className="relative cursor-pointer active:scale-95 transition-transform text-on-surface"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24" }}
            >
              shopping_bag
            </span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-secondary text-on-secondary
                               text-[9px] font-body font-bold flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </button>
        </div>
        {/* Subtle bottom rule */}
        <div className="bg-surface-container-low h-[1px] w-full" />
      </header>

      {/* ── Bottom Navigation (mobile) ──────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center
                      px-4 pb-8 pt-2
                      bg-[#F9F9F9]/90 backdrop-blur-2xl
                      border-t border-black/5">

        {/* Home */}
        <Link to="/" className={`flex flex-col items-center justify-center pt-2 transition-all duration-300
          ${isHome ? 'text-on-surface font-bold border-t-2 border-on-surface' : 'text-outline hover:text-on-surface'}`}>
          <span
            className="material-symbols-outlined mb-1 text-[22px]"
            style={{ fontVariationSettings: isHome ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 200" }}
          >
            home
          </span>
          <span className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]">Accueil</span>
        </Link>

        {/* Catalog */}
        <Link to="/products" className={`flex flex-col items-center justify-center pt-2 transition-all duration-300
          ${isCatalog ? 'text-on-surface font-bold border-t-2 border-on-surface' : 'text-outline hover:text-on-surface'}`}>
          <span
            className="material-symbols-outlined mb-1 text-[22px]"
            style={{ fontVariationSettings: isCatalog ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 200" }}
          >
            menu_book
          </span>
          <span className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]">Catalogue</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className={`flex flex-col items-center justify-center pt-2 transition-all duration-300 relative
          ${isCart ? 'text-on-surface font-bold border-t-2 border-on-surface' : 'text-outline hover:text-on-surface'}`}>
          <span
            className="material-symbols-outlined mb-1 text-[22px]"
            style={{ fontVariationSettings: isCart ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 200" }}
          >
            shopping_bag
          </span>
          {itemCount > 0 && (
            <span className="absolute top-1 right-3 w-3.5 h-3.5 bg-secondary text-on-secondary
                             text-[8px] font-bold flex items-center justify-center rounded-full">
              {itemCount}
            </span>
          )}
          <span className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]">Panier</span>
        </Link>

        {/* About */}
        <Link to="/about" className={`flex flex-col items-center justify-center pt-2 transition-all duration-300
          ${isAbout ? 'text-on-surface font-bold border-t-2 border-on-surface' : 'text-outline hover:text-on-surface'}`}>
          <span
            className="material-symbols-outlined mb-1 text-[22px]"
            style={{ fontVariationSettings: isAbout ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 200" }}
          >
            info
          </span>
          <span className="font-label text-[0.6875rem] uppercase tracking-[0.1rem]">À Propos</span>
        </Link>
      </nav>
    </>
  )
}

export default Navbar
