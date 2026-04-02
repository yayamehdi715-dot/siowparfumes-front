import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function AdminLoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const from         = location.state?.from?.pathname || '/admin'
  const [form, setForm]       = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Identifiants requis'); return }
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0d0d0d' }}>

      {/* Subtle grid bg */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

      <div className="relative w-full max-w-sm animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-headline italic text-3xl tracking-tighter text-white mb-1">
            SIOW PARFUMES
          </h1>
          <p className="font-label text-[0.6rem] uppercase tracking-[0.25rem] text-white/25">
            Espace Administrateur
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#161616] border border-white/8 p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <div>
              <label className="admin-label">Identifiant</label>
              <input type="text" value={form.username} autoComplete="username"
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="admin"
                className="admin-input" />
            </div>

            <div>
              <label className="admin-label">Mot de passe</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  autoComplete="current-password"
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="admin-input pr-12" />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25
                             hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="admin-btn-primary w-full mt-2">
              {loading
                ? <><Loader2 size={13} className="animate-spin" /> Connexion...</>
                : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/15 text-xs font-body mt-6">
          Accès restreint — Personnel autorisé uniquement
        </p>
      </div>
    </div>
  )
}

export default AdminLoginPage