import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, userData, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: 16 }}>Memuat...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && userData?.role !== 'admin') {
    return <Navigate to="/kasir" replace />
  }

  return children
}

export default ProtectedRoute
