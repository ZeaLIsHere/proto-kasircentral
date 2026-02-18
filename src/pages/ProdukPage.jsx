import React, { useEffect, useState } from 'react'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

function ProdukPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')

  const loadProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'))
      const list = []
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }))
      setProducts(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: Number(price || 0),
        stock: Number(stock || 0),
        isActive: true,
      })
      setName('')
      setPrice('')
      setStock('')
      loadProducts()
    } catch (e) {
      console.error(e)
      alert('Gagal menambah produk')
    }
  }

  return (
    <main className="kc-main">
      <div className="kc-glass-card" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0, color: '#34C759' }}>Produk</h2>
        <form
          onSubmit={handleAdd}
          style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}
        >
          <div>
            <label className="kc-label">Nama produk</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="kc-input"
            />
          </div>
          <div>
            <label className="kc-label">Harga</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="kc-input"
            />
          </div>
          <div>
            <label className="kc-label">Stok awal</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="kc-input"
            />
          </div>
          <button type="submit" className="kc-button-primary" style={{ width: 140 }}>
            Tambah
          </button>
        </form>

        {loading ? (
          <div>Memuat produk...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }}>Nama</th>
                <th style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Harga</th>
                <th style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Stok</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: 4 }}>{p.name}</td>
                  <td style={{ padding: 4, textAlign: 'center' }}>Rp{p.price}</td>
                  <td style={{ padding: 4, textAlign: 'center' }}>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}

export default ProdukPage
