import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './Components/ui/Navbar'
import Footer from './Components/ui/Footer'
import PrivateRoute from './Components/ui/PrivateRoute'
import AdminLayout from './Components/admin/AdminLayout'
import HomePage from './pages/public/HomePage'
import ProductsPage from './pages/public/ProductsPage'
import ProductDetailPage from './pages/public/ProductDetailPage'
import CartPage from './pages/public/CartPage'
import ConfirmationPage from './pages/public/ConfirmationPage'
import AboutPage from './pages/public/AboutPage'
import TagProductsPage from './pages/public/TagProductsPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <LanguageProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#ffffff',
                  color: '#1a1c1c',
                  border: '1px solid #e2e2e2',
                  borderRadius: '0px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  letterSpacing: '0.01em',
                  boxShadow: '0 10px 40px rgba(26,28,28,0.08)',
                },
                success: {
                  iconTheme: { primary: '#8C495F', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ba1a1a', secondary: '#fff' },
                },
              }}
            />
            <Routes>
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
              <Route path="/products/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
              <Route path="/tag/:tag" element={<PublicLayout><TagProductsPage /></PublicLayout>} />
              <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
              <Route path="/confirmation" element={<PublicLayout><ConfirmationPage /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LanguageProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App