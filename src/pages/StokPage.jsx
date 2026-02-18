import React, { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

function StokPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', stock: '' })

  useEffect(() => {
    const load = async () => {
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
    load()
  }, [])

  const handleChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: field === 'name' ? value : Number(value) } : p)),
    )
  }

  const openEdit = (product) => {
    setEditingId(product.id)
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    try {
      const ref = doc(db, 'products', editingId)
      await updateDoc(ref, {
        name: editForm.name,
        price: Number(editForm.price || 0),
        stock: Number(editForm.stock || 0),
        isActive: true,
      })
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: editForm.name, price: Number(editForm.price), stock: Number(editForm.stock) }
            : p,
        ),
      )
      setEditingId(null)
      setEditForm({ name: '', price: '', stock: '' })
    } catch (e) {
      console.error(e)
      alert('Gagal menyimpan')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', price: '', stock: '' })
  }

  if (loading) {
    return (
      <main className="kc-main">
        <div className="kc-glass-card" style={{ padding: 16 }}>Memuat data stok...</div>
      </main>
    )
  }

  return (
    <main className="kc-main">
      <div className="kc-glass-card" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Manajemen Stok & Harga</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                padding: 12,
                borderRadius: 16,
                border: '1px solid rgba(0,0,0,0.08)',
                background: '#ffffff',
                boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: 80,
                borderLeft: '4px solid var(--kc-green)',
                color: '#212529',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '19.5px', marginBottom: 2, color: '#212529' }}>{p.name}</div>
                <div style={{ fontSize: '15.6px', color: '#6c757d' }}>Rp {p.price.toLocaleString('id-ID')} &nbsp;·&nbsp; Stok: {p.stock}</div>
              </div>
              <button className="kc-nav-logout" onClick={() => openEdit(p)}>
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {editingId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div className="kc-glass-card" style={{ padding: 16, width: '94%', maxWidth: 360 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Edit Produk</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div style={{ marginBottom: 10 }}>
                <label className="kc-label">Nama produk</label>
                <input
                  className="kc-input"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label className="kc-label">Harga</label>
                <input
                  className="kc-input"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="kc-label">Stok</label>
                <input
                  className="kc-input"
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="kc-nav-logout" style={{ flex: 1 }} onClick={handleCancelEdit}>
                  Batal
                </button>
                <button type="submit" className="kc-button-primary" style={{ flex: 1 }}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default StokPage
