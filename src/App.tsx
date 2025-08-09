import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from './pages/auth/LoginPage';
import AdminOfferList from './pages/admin/AdminOfferList';
import AdminOfferCreate from './pages/admin/AdminOfferCreate';
import AgencyOfferList from './pages/agency/AgencyOfferList';
import AgencyOfferDetail from './pages/agency/AgencyOfferDetail';
import AgencyReservationList from './pages/agency/AgencyReservationList';
import AgencyPayment from './pages/agency/AgencyPayment';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminUserList from './pages/admin/AdminUserList';
import AdminReservationList from './pages/admin/AdminReservationList';
import AdminPaymentList from './pages/admin/AdminPaymentList';
import AdminOfferDetail from './pages/admin/AdminOfferDetail';
import AdminOfferEdit from './pages/admin/AdminOfferEdit';
import AdminUserCreate from './pages/admin/AdminUserCreate';
import AgencyProfileForm from './pages/agency/AgencyProfileForm';
import AgencyApproval from './pages/agency/AgencyApproval';
import AgencyAccount from './pages/agency/AgencyAccount';
import AgencyReservationDetail from './pages/agency/AgencyReservationDetail';
import AdminReservationDetail from './pages/admin/AdminReservationDetail';
import PassengersByOffer from './pages/admin/PassengersByOffer';
import AgencyReservationWizard from './pages/agency/AgencyReservationWizard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<Navigate to="/login\" replace />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/offers" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminOfferList />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/offers/new" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminOfferCreate />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminUserList />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/reservations" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminReservationList />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/payments" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminPaymentList />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/offers/:id" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminOfferDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/offers/:id/edit" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminOfferEdit />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/new" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminUserCreate />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/reservations/:id" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminReservationDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/passengers-by-offer" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <PassengersByOffer />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Agency Routes */}
          <Route 
            path="/agency/offers" 
            element={
              <ProtectedRoute requiredRole="agency">
                <Layout>
                  <AgencyOfferList />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/agency/offers/:id" 
            element={
              <ProtectedRoute requiredRole="agency">
                <Layout>
                  <AgencyOfferDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/agency/offers/:id/reserve" 
            element={
              <ProtectedRoute requiredRole="agency">
                <Layout>
                  <AgencyReservationWizard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/agency/reservations" 
            element={
              <ProtectedRoute requiredRole="agency">
                <Layout>
                  <AgencyReservationList />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/agency/reservations/:id" 
            element={
              <ProtectedRoute requiredRole="agency">
                <Layout>
                  <AgencyReservationDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/agency/payment/:id" 
            element={
              <ProtectedRoute requiredRole="agency">
                <Layout>
                  <AgencyPayment />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/agency/profile" 
            element={
              <ProtectedRoute requiredRole="agency">
                <Layout>
                  <AgencyAccount />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/agency/approval" 
            element={
              <ProtectedRoute requiredRole="agency">
                <Layout>
                  <AgencyApproval />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/agency/account" 
            element={
              <ProtectedRoute requiredRole="agency">
                <Layout>
                  <AgencyAccount />
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;