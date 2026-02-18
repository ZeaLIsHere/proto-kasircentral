import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navbar() {
  const { userData, logout } = useAuth()
  const location = useLocation()

  if (location.pathname === '/login') {
    return null
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <header className="kc-navbar">
      <div className="kc-nav-left">
        <div>
          <img src="/logo-central.svg" alt="Logo" className="kc-logo kc-logo-sm" />
        </div>
        <div className="kc-app-title">KasirCentral</div>
      </div>
      <nav className="kc-nav-links">
        <Link to="/beranda">Beranda</Link>
        <Link to="/kasir">Kasir</Link>
        {userData?.role === 'admin' && (
          <>
            <Link to="/stok">Stok</Link>
            <Link to="/laporan">Laporan</Link>
          </>
        )}
        <span className="kc-nav-user">
          {userData ? `${userData.name} (${userData.role})` : ''}
        </span>
        <button className="kc-nav-logout " onClick={handleLogout}>
          Keluar
        </button>
      </nav>
    </header>
  )
}

export default Navbar
