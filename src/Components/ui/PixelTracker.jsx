import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../../utils/pixels'

// ─── PageView sur changement de route ─────────────────────────────────────────
// Le site est une SPA : sans ce composant, les pixels ne compteraient qu'une
// seule vue par session (le chargement initial). Monté à l'intérieur du Router.
// Le back-office /admin est volontairement exclu du tracking.
function PixelTracker() {
  const { pathname, search } = useLocation()
  const lastUrl = useRef(null)

  useEffect(() => {
    const url = pathname + search
    // Garde-fou : StrictMode rejoue les effets en dev, on ne veut qu'un envoi.
    if (lastUrl.current === url) return
    lastUrl.current = url

    if (pathname.startsWith('/admin')) return
    trackPageView()
  }, [pathname, search])

  return null
}

export default PixelTracker
