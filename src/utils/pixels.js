// src/utils/pixels.js
// ─── Tracking publicitaire : Meta Pixel + TikTok Pixel ────────────────────────
// Point d'entrée unique du tracking. Aucun composant n'appelle fbq/ttq
// directement : tout passe par les helpers exportés ici.
//
// Règles de conception :
//  • Si les IDs ne sont pas configurés → tout devient no-op silencieux.
//  • Si les scripts sont bloqués (adblock) → tout est en try/catch.
//  • En développement rien n'est envoyé, sauf VITE_PIXEL_DEBUG=true.
//  • Chaque événement porte un ID partagé Meta/TikTok, pour permettre la
//    déduplication le jour où une Conversions API serveur sera branchée.

const META_ID   = (import.meta.env.VITE_META_PIXEL_ID   || '').trim()
const TIKTOK_ID = (import.meta.env.VITE_TIKTOK_PIXEL_ID || '').trim()
const CURRENCY  = (import.meta.env.VITE_PIXEL_CURRENCY  || 'DZD').trim()

// Meta refuse DZD : le pixel loggue « Parameter 'currency' is invalid » et la
// valeur devient inexploitable (ROAS, optimisation sur la valeur).
// Pour y remédier : VITE_PIXEL_CURRENCY=USD + VITE_PIXEL_RATE=<DZD pour 1 USD>.
// Les prix restent en DZD dans le site, seule la valeur envoyée est convertie.
const RATE = Math.max(Number(import.meta.env.VITE_PIXEL_RATE) || 1, 0.000001)

// Clé localStorage des données de correspondance avancée Meta. Elles ne
// peuvent être fournies qu'au tout premier fbq('init') : un second init
// déclenche « Duplicate Pixel ID » et les événements cessent de partir.
const AM_STORAGE_KEY = 'siow_pixel_am'

// Correspondance avancée : transmet téléphone / nom / ville au moment de la
// commande (hachés en SHA-256 par les pixels eux-mêmes) pour améliorer
// l'attribution. Mettre VITE_PIXEL_ADVANCED_MATCHING=false pour désactiver.
const ADVANCED_MATCHING = import.meta.env.VITE_PIXEL_ADVANCED_MATCHING !== 'false'

const DEBUG   = import.meta.env.VITE_PIXEL_DEBUG === 'true'
const ENABLED = (import.meta.env.PROD || DEBUG) && Boolean(META_ID || TIKTOK_ID)

const log = (...args) => { if (DEBUG) console.log('[pixels]', ...args) }

// ─── Chargement des scripts ──────────────────────────────────────────────────
// Les deux snippets officiels sont volontairement amputés de leur PageView
// initial : c'est PixelTracker qui l'émet, sinon la première vue serait
// comptée deux fois (une par le snippet, une par le routeur).

function loadMeta() {
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  // Un seul init, avec la correspondance avancée du client si on la connaît
  // déjà (commande précédente). Ne jamais rappeler init ensuite.
  const stored = ADVANCED_MATCHING ? readStoredMatching() : null
  const matching = stored ? toMetaMatching(stored) : null
  if (matching) window.fbq('init', META_ID, matching)
  else          window.fbq('init', META_ID)
}

function loadTikTok() {
  /* eslint-disable */
  !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=d.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=d.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load(TIKTOK_ID)}(window,document,'ttq')
  /* eslint-enable */

  // TikTok accepte identify() à tout moment : on réapplique la correspondance
  // avancée d'une commande précédente dès le chargement.
  const stored = ADVANCED_MATCHING ? readStoredMatching() : null
  const matching = stored ? toTikTokMatching(stored) : null
  if (matching) window.ttq.identify(matching)
}

let initialized = false

export function initPixels() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  if (!ENABLED) {
    log('inactif', {
      prod:   import.meta.env.PROD,
      meta:   META_ID   ? 'configuré' : 'absent',
      tiktok: TIKTOK_ID ? 'configuré' : 'absent',
    })
    return
  }

  try { if (META_ID)   loadMeta()   } catch (err) { log('chargement Meta échoué', err) }
  try { if (TIKTOK_ID) loadTikTok() } catch (err) { log('chargement TikTok échoué', err) }
  log('actif', { meta: Boolean(META_ID), tiktok: Boolean(TIKTOK_ID), currency: CURRENCY })
}

// ─── Envoi bas niveau ────────────────────────────────────────────────────────

function sendMeta(event, params, options) {
  if (!ENABLED || !META_ID) return
  try { window.fbq?.('track', event, params, options) }
  catch (err) { log(`Meta ${event} échoué`, err) }
}

function sendTikTok(event, props, options) {
  if (!ENABLED || !TIKTOK_ID) return
  try { window.ttq?.track?.(event, props, options) }
  catch (err) { log(`TikTok ${event} échoué`, err) }
}

// ─── Normalisation ───────────────────────────────────────────────────────────

const num   = (v) => Number(v ?? 0) || 0
const clean = (v) => String(v ?? '').trim().toLowerCase()

// 0551234567 → 213551234567 (format international attendu par Meta et TikTok)
function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (!digits)                  return ''
  if (digits.startsWith('213')) return digits
  if (digits.startsWith('0'))   return `213${digits.slice(1)}`
  return digits
}

// Les prix du site sont en DZD ; la valeur envoyée aux pixels est convertie
// si une devise + un taux ont été configurés.
function toPixelValue(dzd) {
  const v = num(dzd) / RATE
  return Math.round(v * 100) / 100
}

// Correspondance avancée persistée d'une visite à l'autre : c'est le seul
// moyen sûr d'en faire profiter Meta, qui ne l'accepte qu'au premier init.
function readStoredMatching() {
  try {
    const raw = localStorage.getItem(AM_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data && typeof data === 'object' && Object.keys(data).length > 0 ? data : null
  } catch (err) {
    log('lecture correspondance avancée impossible', err)
    return null
  }
}

function writeStoredMatching(data) {
  try { localStorage.setItem(AM_STORAGE_KEY, JSON.stringify(data)) }
  catch (err) { log('écriture correspondance avancée impossible', err) }
}

// Le format stocké est neutre ({ phone, first, last, city, state }) ; chaque
// plateforme attend ses propres noms de champs.
function toMetaMatching(d) {
  const out = {
    ph: d.phone, fn: d.first, ln: d.last, ct: d.city, st: d.state, country: 'dz',
  }
  Object.keys(out).forEach((k) => { if (!out[k]) delete out[k] })
  return Object.keys(out).length > 1 ? out : null
}

function toTikTokMatching(d) {
  const out = {
    phone_number: d.phone ? `+${d.phone}` : '',
    first_name:   d.first,
    last_name:    d.last,
    city:         d.city,
    state:        d.state,
    country:      'DZ',
  }
  Object.keys(out).forEach((k) => { if (!out[k]) delete out[k] })
  return Object.keys(out).length > 1 ? out : null
}

// ID d'événement partagé entre les deux pixels. Avec `seed` (l'id de commande)
// il devient stable : un rechargement ne créera pas un second achat.
function makeEventId(prefix, seed) {
  if (seed) return `${prefix}.${seed}`
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`
}

// Format pivot interne : { id, name, brand, category, price, quantity }
function lineFromProduct(product, { price, quantity = 1 } = {}) {
  return {
    id:       String(product?._id ?? ''),
    name:     product?.name     ?? '',
    brand:    product?.brand    ?? '',
    category: product?.category ?? '',
    price:    num(price ?? product?.price),
    quantity: num(quantity) || 1,
  }
}

function linesFromCart(items = []) {
  return items.map((item) => ({
    id:       String(item?.productId ?? ''),
    name:     item?.name  ?? '',
    brand:    item?.brand ?? '',
    category: '',
    price:    num(item?.price),
    quantity: num(item?.quantity) || 1,
  }))
}

const metaContents = (lines) => lines.map((l) => ({
  id: l.id, quantity: l.quantity, item_price: toPixelValue(l.price),
}))

const tiktokContents = (lines) => lines.map((l) => ({
  content_id:   l.id,
  content_type: 'product',
  content_name: l.name,
  price:        toPixelValue(l.price),
  quantity:     l.quantity,
}))

const sumQuantity = (lines) => lines.reduce((n, l) => n + l.quantity, 0)
const sumValue    = (lines) => lines.reduce((n, l) => n + l.price * l.quantity, 0)

// ─── Événements ──────────────────────────────────────────────────────────────

export function trackPageView() {
  if (!ENABLED) return
  try { window.fbq?.('track', 'PageView') } catch (err) { log('Meta PageView échoué', err) }
  try { window.ttq?.page?.() }             catch (err) { log('TikTok Pageview échoué', err) }
  log('PageView')
}

export function trackViewContent(product, price) {
  if (!ENABLED || !product) return
  const line    = lineFromProduct(product, { price })
  const value   = toPixelValue(line.price)
  const eventId = makeEventId('view')

  sendMeta('ViewContent', {
    content_ids:      [line.id],
    content_type:     'product',
    content_name:     line.name,
    content_category: line.category,
    contents:         metaContents([line]),
    value,
    currency:         CURRENCY,
  }, { eventID: eventId })

  sendTikTok('ViewContent', {
    contents:     tiktokContents([line]),
    content_type: 'product',
    value,
    currency:     CURRENCY,
  }, { event_id: eventId })

  log('ViewContent', line)
}

export function trackAddToCart({ product, size, quantity = 1, price } = {}) {
  if (!ENABLED || !product) return
  const line    = lineFromProduct(product, { price, quantity })
  const value   = toPixelValue(line.price * line.quantity)
  const eventId = makeEventId('atc')

  sendMeta('AddToCart', {
    content_ids:      [line.id],
    content_type:     'product',
    content_name:     line.name,
    content_category: line.category,
    contents:         metaContents([line]),
    num_items:        line.quantity,
    value,
    currency:         CURRENCY,
  }, { eventID: eventId })

  sendTikTok('AddToCart', {
    contents:     tiktokContents([line]),
    content_type: 'product',
    value,
    currency:     CURRENCY,
  }, { event_id: eventId })

  log('AddToCart', { ...line, size, value })
}

export function trackInitiateCheckout(items, total) {
  if (!ENABLED) return
  const lines = linesFromCart(items)
  if (lines.length === 0) return
  const value   = toPixelValue(num(total) || sumValue(lines))
  const eventId = makeEventId('checkout')

  sendMeta('InitiateCheckout', {
    content_ids:  lines.map((l) => l.id),
    content_type: 'product',
    contents:     metaContents(lines),
    num_items:    sumQuantity(lines),
    value,
    currency:     CURRENCY,
  }, { eventID: eventId })

  sendTikTok('InitiateCheckout', {
    contents:     tiktokContents(lines),
    content_type: 'product',
    value,
    currency:     CURRENCY,
  }, { event_id: eventId })

  log('InitiateCheckout', { value, lines })
}

export function trackAddPaymentInfo(items, total) {
  if (!ENABLED) return
  const lines = linesFromCart(items)
  if (lines.length === 0) return
  const value   = toPixelValue(num(total) || sumValue(lines))
  const eventId = makeEventId('payinfo')

  sendMeta('AddPaymentInfo', {
    content_ids:  lines.map((l) => l.id),
    content_type: 'product',
    contents:     metaContents(lines),
    value,
    currency:     CURRENCY,
  }, { eventID: eventId })

  sendTikTok('AddPaymentInfo', {
    contents:     tiktokContents(lines),
    content_type: 'product',
    value,
    currency:     CURRENCY,
  }, { event_id: eventId })

  log('AddPaymentInfo', { value })
}

// Paiement à la livraison : la commande validée est l'équivalent de l'achat.
// Meta → Purchase. TikTok → PlaceAnOrder (commande passée) + CompletePayment
// (l'événement sur lequel les campagnes TikTok optimisent par défaut).
export function trackPurchase({ orderId, items, total } = {}) {
  if (!ENABLED) return
  const lines = linesFromCart(items)
  if (lines.length === 0) return
  const value   = toPixelValue(num(total) || sumValue(lines))
  const eventId = makeEventId('purchase', orderId)

  sendMeta('Purchase', {
    content_ids:  lines.map((l) => l.id),
    content_type: 'product',
    contents:     metaContents(lines),
    num_items:    sumQuantity(lines),
    order_id:     orderId ? String(orderId) : undefined,
    value,
    currency:     CURRENCY,
  }, { eventID: eventId })

  const tiktokProps = {
    contents:     tiktokContents(lines),
    content_type: 'product',
    order_id:     orderId ? String(orderId) : undefined,
    value,
    currency:     CURRENCY,
  }
  sendTikTok('PlaceAnOrder',    tiktokProps, { event_id: `${eventId}.order` })
  sendTikTok('CompletePayment', tiktokProps, { event_id: eventId })

  log('Purchase', { orderId, value, lines })
}

export function trackSearch(query) {
  if (!ENABLED) return
  const q = String(query ?? '').trim()
  if (!q) return
  const eventId = makeEventId('search')

  sendMeta('Search',   { search_string: q }, { eventID: eventId })
  sendTikTok('Search', { query: q },         { event_id: eventId })

  log('Search', q)
}

// ─── Correspondance avancée ──────────────────────────────────────────────────
// Appelée au moment de la commande. Les valeurs sont hachées en SHA-256 par
// les pixels avant tout envoi réseau — rien ne part en clair.
//
// Asymétrie voulue entre les deux plateformes :
//  • TikTok expose ttq.identify(), utilisable à tout moment → envoi immédiat.
//  • Meta n'accepte ces données qu'au tout premier fbq('init'). Un second init
//    provoque « Duplicate Pixel ID » et, vérifié en conditions réelles, tous
//    les événements porteurs de paramètres cessent de partir (seuls les
//    PageView passent encore). On se contente donc de les mémoriser : elles
//    seront injectées à l'init de la visite suivante.

export function identifyCustomer(info = {}) {
  if (!ENABLED || !ADVANCED_MATCHING) return

  const phone = normalizePhone(info.phone)
  const first = clean(info.firstName)
  const last  = clean(info.lastName)
  const city  = clean(info.commune).replace(/\s+/g, '')
  const state = clean(info.wilaya).replace(/\s+/g, '')

  const data = { phone, first, last, city, state }
  if (!phone && !first && !last) return

  writeStoredMatching(data)

  if (TIKTOK_ID) {
    const tiktokData = toTikTokMatching(data)
    if (tiktokData) {
      try { window.ttq?.identify?.(tiktokData) }
      catch (err) { log('TikTok identify échoué', err) }
    }
  }

  log('identify', { phone: Boolean(phone), city, state, metaDiffere: Boolean(META_ID) })
}
