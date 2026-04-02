import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ClipboardList, LogOut, Menu, X, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produits',   icon: Package },
  { to: '/admin/orders',   label: 'Commandes',  icon: ClipboardList },
  { to: '/admin/settings', label: 'Sécurité',   icon: Settings },
]

function SidebarContent({ onClose, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-7 border-b border-white/8">
        <p className="font-headline italic text-xl tracking-tighter text-white leading-none">
          SIOW PARFUMES
        </p>
        <p className="font-label text-[0.6rem] uppercase tracking-[0.2rem] text-white/30 mt-1">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-all duration-200
               border-l-2 font-label text-[0.6875rem] uppercase tracking-[0.12rem]
               ${isActive
                 ? 'border-amber-400 text-amber-400 bg-amber-400/8'
                 : 'border-transparent text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20'
               }`
            }>
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/8">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/30
                     hover:text-red-400 hover:bg-red-400/5 transition-colors
                     font-label text-[0.6875rem] uppercase tracking-[0.12rem]">
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </div>
  )
}

function AdminLayout() {
  const { logout }       = useAuth()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Déconnecté')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0d0d' }}>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#111111] border-r border-white/8
                        flex-shrink-0 fixed h-full z-30">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Sidebar mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-[#111111] border-r border-white/8"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/30 hover:text-white">
              <X size={18} />
            </button>
            <SidebarContent onClose={() => setOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4
                           bg-[#111111] border-b border-white/8">
          <button onClick={() => setOpen(true)}
            className="p-2 text-white/40 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-headline italic text-lg tracking-tighter text-white">
            SIOW PARFUMES
          </span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout