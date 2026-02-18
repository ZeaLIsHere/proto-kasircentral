import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const redirectTo = location.state?.from?.pathname || '/beranda'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      console.error(err)
      setError('Email atau kata sandi salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      {/* Logo Section */}
      <div style={{ textAlign: 'center', marginBottom: '5px' }}>
        <img 
          src="/logo-central.svg" 
          alt="KasirCentral Logo" 
          style={{ 
            height: '100px', 
            width: '100px',
            objectFit: 'cover',
            borderRadius: '50%',
            border: '2px solid #fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }} 
        />
      </div>

      {/* Login Form */}
      <div className="kc-glass-card kc-auth-card">
        <h1>Masuk KasirCentral</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="kc-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="kc-input"
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label className="kc-label">Kata sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="kc-input"
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: '12px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="kc-button-primary"
            style={{ width: '100%', padding: '10px', marginTop: '8px' }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          Belum punya akun? <Link to="/register" style={{ color: '#28a745', fontWeight: 'bold' }}>Daftar</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
