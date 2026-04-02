import { useState } from 'react'
import { Eye, EyeOff, Loader2, Shield, User, Lock, CheckCircle } from 'lucide-react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// FieldSet hors composant pour éviter le bug de focus
function FieldSet({ label, error, children }) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {children}
      {error && <p className="text-red-400/80 text-xs mt-1.5">{error}</p>}
    </div>
  )
}

function AdminSettingsPage() {
  const { logout } = useAuth()

  const [form, setForm] = useState({
    currentPassword: '',
    newUsername:     '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [show, setShow]     = useState({ current: false, new: false, confirm: false })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: '' }))
    setSuccess(false)
  }

  const validate = () => {
    const e = {}
    if (!form.currentPassword) e.currentPassword = 'Mot de passe actuel requis'
    if (!form.newUsername && !form.newPassword) {
      e.newUsername = 'Modifiez au moins l\'identifiant ou le mot de passe'
    }
    if (form.newPassword && form.newPassword.length < 8) {
      e.newPassword = 'Minimum 8 caractères'
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      e.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const res = await api.put('/auth/credentials', {
        currentPassword: form.currentPassword,
        newUsername:     form.newUsername.trim() || undefined,
        newPassword:     form.newPassword || undefined,
      })

      // Mettre à jour le token avec les nouvelles infos
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token)
      }

      setSuccess(true)
      setForm({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' })
      toast.success('Identifiants mis à jour — reconnectez-vous')

      // Déconnecter après 2s pour forcer la reconnexion avec les nouveaux credentials
      setTimeout(() => logout(), 2000)

    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <p className="admin-label">Configuration</p>
        <h1 className="font-headline text-4xl text-white tracking-tight">Sécurité</h1>
      </div>

      {/* Info card */}
      <div className="admin-card border-amber-400/20 bg-amber-400/[0.03]">
        <div className="flex items-start gap-3">
          <Shield size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-label text-[0.6875rem] uppercase tracking-[0.1rem] text-amber-400 mb-1">
              Accès sécurisé
            </p>
            <p className="font-body text-white/40 text-xs leading-relaxed">
              Le mot de passe est stocké chiffré (bcrypt). Après modification, vous serez
              automatiquement déconnecté et devrez vous reconnecter avec les nouveaux identifiants.
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="admin-card space-y-6" noValidate>

        <p className="admin-label text-white/60">Modifier les identifiants</p>

        {/* Mot de passe actuel */}
        <FieldSet label="Mot de passe actuel *" error={errors.currentPassword}>
          <div className="relative">
            <input
              name="currentPassword"
              type={show.current ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Votre mot de passe actuel"
              className="admin-input pr-12"
              autoComplete="current-password"
            />
            <button type="button"
              onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
              {show.current ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </FieldSet>

        <div className="border-t border-white/8" />

        {/* Nouvel identifiant */}
        <FieldSet label="Nouvel identifiant (laisser vide pour ne pas changer)" error={errors.newUsername}>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            <input
              name="newUsername"
              type="text"
              value={form.newUsername}
              onChange={handleChange}
              placeholder="Ex: admin_siow"
              className="admin-input pl-9"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
        </FieldSet>

        {/* Nouveau mot de passe */}
        <FieldSet label="Nouveau mot de passe (laisser vide pour ne pas changer)" error={errors.newPassword}>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            <input
              name="newPassword"
              type={show.new ? 'text' : 'password'}
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Minimum 8 caractères"
              className="admin-input pl-9 pr-12"
              autoComplete="new-password"
            />
            <button type="button"
              onClick={() => setShow((s) => ({ ...s, new: !s.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
              {show.new ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {/* Indicateur de force */}
          {form.newPassword && (
            <div className="flex gap-1 mt-2">
              {[1,2,3,4].map((n) => (
                <div key={n} className={`h-1 flex-1 transition-colors duration-300 ${
                  form.newPassword.length >= n * 3
                    ? n <= 1 ? 'bg-red-400' : n <= 2 ? 'bg-amber-400' : n <= 3 ? 'bg-yellow-300' : 'bg-emerald-400'
                    : 'bg-white/10'
                }`} />
              ))}
              <span className="text-[0.6rem] text-white/30 font-label ml-2 self-center">
                {form.newPassword.length < 8 ? 'Faible' : form.newPassword.length < 12 ? 'Moyen' : 'Fort'}
              </span>
            </div>
          )}
        </FieldSet>

        {/* Confirmer nouveau mot de passe */}
        {form.newPassword && (
          <FieldSet label="Confirmer le nouveau mot de passe" error={errors.confirmPassword}>
            <div className="relative">
              <input
                name="confirmPassword"
                type={show.confirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez le nouveau mot de passe"
                className="admin-input pr-12"
                autoComplete="new-password"
              />
              <button type="button"
                onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                {show.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FieldSet>
        )}

        {/* Succès */}
        {success && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 p-3">
            <CheckCircle size={14} />
            <p className="font-body text-xs">Mis à jour — déconnexion dans 2 secondes…</p>
          </div>
        )}

        {/* Bouton */}
        <div className="pt-2 border-t border-white/8">
          <button type="submit" disabled={saving}
            className="admin-btn-primary flex items-center gap-2 justify-center w-full sm:w-auto px-8">
            {saving
              ? <><Loader2 size={13} className="animate-spin" /> Enregistrement…</>
              : <><Shield size={13} /> Mettre à jour les identifiants</>}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettingsPage