import { Link } from 'react-router-dom'

const VALUES = [
  { icon: 'favorite',       title: 'Passion',     desc: 'Chaque pièce est choisie avec soin pour votre satisfaction.' },
  { icon: 'verified',       title: 'Qualité',     desc: 'Des matières et fragrances soigneusement sélectionnées.' },
  { icon: 'local_shipping', title: 'Livraison',   desc: 'Partout en Algérie, rapidement et en toute sécurité.' },
  { icon: 'star',           title: 'Satisfaction', desc: 'Votre bonheur est notre priorité absolue.' },
]

function AboutPage() {
  return (
    <div className="min-h-screen bg-surface pt-16 pb-32">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="bg-surface-container-low pt-16 pb-16 px-6">
        <div className="max-w-2xl">
          <span className="stitch-label block mb-4">Notre histoire</span>
          <h1 className="font-headline text-on-surface text-5xl md:text-6xl font-bold
                         tracking-tighter leading-tight mb-6">
            Qui sommes-nous ?
          </h1>
          <p className="font-body text-on-surface-variant text-base leading-relaxed max-w-lg">
            SIOW Parfumes, c'est avant tout une passion pour l'excellence et la curation
            de pièces rares, proposées aux connaisseurs les plus exigeants d'Algérie.
          </p>
        </div>
      </div>

      {/* ── Mission ──────────────────────────────────────────────── */}
      <div className="px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-4xl">
          <div>
            <span className="stitch-label block mb-4">Notre mission</span>
            <h2 className="font-headline text-on-surface text-4xl font-bold tracking-tighter mb-5">
              L'excellence au quotidien
            </h2>
            <p className="font-body text-on-surface-variant leading-relaxed text-sm">
              Nous croyons que la mode et le parfum sont une expression de soi. C'est pourquoi
              nous proposons une sélection soignée de pièces — du quotidien aux occasions
              spéciales — avec un souci constant de qualité et d'authenticité.
            </p>
          </div>
          <div className="bg-surface-container-highest aspect-square flex items-center justify-center">
            <span
              className="material-symbols-outlined text-on-surface-variant"
              style={{ fontSize: '5rem', fontVariationSettings: "'FILL' 0, 'wght' 100" }}
            >
              storefront
            </span>
          </div>
        </div>
      </div>

      {/* Visual separator */}
      <div className="bg-surface-container-highest h-px mx-6" />

      {/* ── Values ───────────────────────────────────────────────── */}
      <div className="px-6 py-20">
        <span className="stitch-label block mb-4 text-center">Nos valeurs</span>
        <h2 className="font-headline text-on-surface text-4xl font-bold tracking-tighter
                       text-center mb-14">
          Ce qui nous définit
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {VALUES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-surface-container-low p-6 flex gap-4">
              <span
                className="material-symbols-outlined text-secondary mt-0.5 flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                {icon}
              </span>
              <div>
                <h3 className="font-headline text-on-surface text-lg font-bold mb-1">{title}</h3>
                <p className="font-body text-on-surface-variant text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="text-center px-6">
        <Link to="/products" className="btn-primary">
          Découvrir le catalogue
        </Link>
      </div>
    </div>
  )
}

export default AboutPage
