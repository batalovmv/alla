import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout/AdminLayout'
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute'
import { ROUTES } from './config/routes'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home/Home'))
const Procedures = lazy(() => import('./pages/Procedures/Procedures'))
const ProcedureDetail = lazy(() => import('./pages/ProcedureDetail/ProcedureDetail'))
const About = lazy(() => import('./pages/About/About'))
const Reviews = lazy(() => import('./pages/Reviews/Reviews'))
const Contacts = lazy(() => import('./pages/Contacts/Contacts'))

// Admin pages
const AdminLogin = lazy(() => import('./pages/Admin/Login/Login'))
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard/Dashboard'))
const AdminProcedures = lazy(() => import('./pages/Admin/Procedures/Procedures'))
const AdminReviews = lazy(() => import('./pages/Admin/Reviews/Reviews'))
const AdminContacts = lazy(() => import('./pages/Admin/Contacts/Contacts'))
const AdminAbout = lazy(() => import('./pages/Admin/About/About'))
const AdminBookings = lazy(() => import('./pages/Admin/Bookings/Bookings'))

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh' 
  }}>
    <div>Загрузка...</div>
  </div>
)

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/*" element={
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/procedures" element={<Procedures />} />
              <Route path="/procedures/:id" element={<ProcedureDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contacts" element={<Contacts />} />
            </Routes>
          </Suspense>
        </Layout>
      } />

      {/* Admin routes */}
      <Route path="/admin/login" element={
        <Suspense fallback={<PageLoader />}>
          <AdminLogin />
        </Suspense>
      } />
      
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="procedures" element={<AdminProcedures />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="contacts" element={<AdminContacts />} />
                <Route path="about" element={<AdminAbout />} />
                <Route path="bookings" element={<AdminBookings />} />
              </Routes>
            </AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App

