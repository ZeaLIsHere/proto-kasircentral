import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid

      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        role: 'admin',
        createdAt: serverTimestamp(),
      })

      navigate('/kasir', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Gagal mendaftar. Periksa data Anda atau coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="kc-glass-card kc-auth-card">
      <h1>Daftar Akun</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label className="kc-label">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="kc-input"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label className="kc-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="kc-input"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label className="kc-label">Kata sandi</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="kc-input"
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: 8 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="kc-button-primary">
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
    </div>
  )
}

export default RegisterPage
