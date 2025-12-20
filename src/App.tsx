import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout/AdminLayout'
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute'
import { PageFallback } from './components/common/PageFallback/PageFallback'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home/Home'))
const Procedures = lazy(() => import('./pages/Procedures/Procedures'))
const ProcedureDetail = lazy(() => import('./pages/ProcedureDetail/ProcedureDetail'))
const About = lazy(() => import('./pages/About/About'))
const Reviews = lazy(() => import('./pages/Reviews/Reviews'))
const Contacts = lazy(() => import('./pages/Contacts/Contacts'))
const Privacy = lazy(() => import('./pages/Privacy/Privacy'))

// Admin pages
const AdminLogin = lazy(() => import('./pages/Admin/Login/Login'))
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard/Dashboard'))
const AdminProcedures = lazy(() => import('./pages/Admin/Procedures/Procedures'))
const AdminReviews = lazy(() => import('./pages/Admin/Reviews/Reviews'))
const AdminContacts = lazy(() => import('./pages/Admin/Contacts/Contacts'))
const AdminAbout = lazy(() => import('./pages/Admin/About/About'))
const AdminBookings = lazy(() => import('./pages/Admin/Bookings/Bookings'))
const AdminClients = lazy(() => import('./pages/Admin/Clients/Clients'))
const AdminClientHistory = lazy(() => import('./pages/Admin/Clients/ClientHistory'))
const AdminReports = lazy(() => import('./pages/Admin/Reports/Reports'))

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<PageFallback variant="home" />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="/procedures"
              element={
                <Suspense fallback={<PageFallback variant="procedures" />}>
                  <Procedures />
                </Suspense>
              }
            />
            <Route
              path="/procedures/:id"
              element={
                <Suspense fallback={<PageFallback variant="procedureDetail" />}>
                  <ProcedureDetail />
                </Suspense>
              }
            />
            <Route
              path="/about"
              element={
                <Suspense fallback={<PageFallback variant="about" />}>
                  <About />
                </Suspense>
              }
            />
            <Route
              path="/reviews"
              element={
                <Suspense fallback={<PageFallback variant="reviews" />}>
                  <Reviews />
                </Suspense>
              }
            />
            <Route
              path="/contacts"
              element={
                <Suspense fallback={<PageFallback variant="contacts" />}>
                  <Contacts />
                </Suspense>
              }
            />
            <Route
              path="/privacy"
              element={
                <Suspense fallback={<PageFallback variant="privacy" />}>
                  <Privacy />
                </Suspense>
              }
            />
          </Routes>
        </Layout>
      } />

      {/* Admin routes */}
      <Route path="/admin/login" element={
        <Suspense fallback={<PageFallback variant="admin" />}>
          <AdminLogin />
        </Suspense>
      } />
      
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={
          <Suspense fallback={<PageFallback variant="admin" />}>
            <AdminDashboard />
          </Suspense>
        } />
        <Route path="procedures" element={
          <Suspense fallback={<PageFallback variant="admin" />}>
            <AdminProcedures />
          </Suspense>
        } />
        <Route path="reviews" element={
          <Suspense fallback={<PageFallback variant="admin" />}>
            <AdminReviews />
          </Suspense>
        } />
        <Route path="contacts" element={
          <Suspense fallback={<PageFallback variant="admin" />}>
            <AdminContacts />
          </Suspense>
        } />
        <Route path="about" element={
          <Suspense fallback={<PageFallback variant="admin" />}>
            <AdminAbout />
          </Suspense>
        } />
        <Route path="bookings" element={
          <Suspense fallback={<PageFallback variant="admin" />}>
            <AdminBookings />
          </Suspense>
        } />
        <Route path="clients" element={
          <Suspense fallback={<PageFallback variant="admin" />}>
            <AdminClients />
          </Suspense>
        } />
        <Route path="clients/:clientId" element={
          <Suspense fallback={<PageFallback variant="admin" />}>
            <AdminClientHistory />
          </Suspense>
        } />
        <Route path="reports" element={
          <Suspense fallback={<PageFallback variant="admin" />}>
            <AdminReports />
          </Suspense>
        } />
      </Route>
    </Routes>
  )
}

export default App

