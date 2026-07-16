import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerPage from './pages/CustomerPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer interface — public, the QR code opens this */}
          <Route path="/rx" element={<CustomerPage />} />

          {/* Pharmacist login — public gate */}
          <Route path="/login" element={<LoginPage />} />

          {/* Pharmacist dashboard — protected, requires login */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Root and unknown routes redirect to customer page */}
          <Route path="/" element={<Navigate to="/rx" replace />} />
          <Route path="*" element={<Navigate to="/rx" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
