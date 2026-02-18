import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BerandaPage from './pages/BerandaPage'
import KasirPage from './pages/KasirPage'
import StokPage from './pages/StokPage'
import LaporanPage from './pages/LaporanPage'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/beranda"
            element={
              <ProtectedRoute>
                <BerandaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kasir"
            element={
              <ProtectedRoute>
                <KasirPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stok"
            element={
              <ProtectedRoute requireAdmin>
                <StokPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/laporan"
            element={
              <ProtectedRoute requireAdmin>
                <LaporanPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/beranda" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
