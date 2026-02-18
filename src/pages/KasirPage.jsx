import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { collection, doc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

function KasirPage() {
  const { user, userData } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('tunai')
  const [paidAmount, setPaidAmount] = useState('')
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'))
        const list = []
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }))
        setProducts(list.filter((p) => p.isActive !== false))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item,
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }
  
  useEffect(() => {
    if (!products.length) return

    const addProductId = location.state?.addProductId
    if (!addProductId) return

    const product = products.find((p) => p.id === addProductId)
    if (product) {
      addToCart(product)
    }

    navigate(location.pathname, { replace: true, state: {} })
  }, [products, location, navigate])

  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: qty < 1 ? 1 : qty }
          : item,
      ),
    )
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  )

  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'tunai') return 0
    const paid = Number(paidAmount || 0)
    return paid > total ? paid - total : 0
  }, [paymentMethod, paidAmount, total])

  const handleSaveSale = async () => {
    if (!cart.length) return
    try {
      const saleId = `${Date.now()}_${user.uid}`
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10)

      const items = cart.map((item) => ({
        productId: item.id,
        nameSnapshot: item.name,
        priceSnapshot: item.price,
        qty: item.qty,
        subtotal: item.price * item.qty,
      }))

      await setDoc(doc(db, 'sales', saleId), {
        createdAt: serverTimestamp(),
        date: dateStr,
        cashierId: user.uid,
        cashierNameSnapshot: userData?.name || '',
        items,
        paymentMethod,
        total,
        paidAmount: paymentMethod === 'tunai' ? Number(paidAmount || 0) : null,
        changeAmount: paymentMethod === 'tunai' ? changeAmount : null,
      })

      for (const item of cart) {
        const productRef = doc(db, 'products', item.id)
        await updateDoc(productRef, {
          stock: item.stock - item.qty,
        })
      }

      setCart([])
      setPaidAmount('')
      alert('Transaksi tersimpan')
    } catch (e) {
      console.error(e)
      alert('Gagal menyimpan transaksi')
    }
  }

  if (loading) {
    return (
      <main className="kc-main">
        <div className="kc-glass-card" style={{ padding: 16 }}>Memuat produk...</div>
      </main>
    )
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: 12,
    gap: 8,
  }

  return (
    <main className="kc-main">
      <div className="kc-glass-card" style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ margin: 0 }}>Kasir</h2>
          <div style={{ fontSize: 12, color: '#d7e5da' }}>{userData?.name}</div>
        </div>

        <h3 style={{ margin: '4px 0 8px' }}>Daftar Produk</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(var(--kc-product-grid-cols), 1fr)',
            gap: 12,
          }}
        >
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              style={{
                padding: 16,
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                textAlign: 'left',
                backgroundColor: '#ffffff',
                color: '#212529',
                boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--kc-green)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '20px', marginBottom: 4, color: '#212529' }}>{p.name}</div>
              <div style={{ fontSize: '17px', color: '#6c757d' }}>Rp {p.price.toLocaleString('id-ID')}</div>
              <div style={{ fontSize: '15px', color: '#242527ff', marginBottom: 8 }}>Stok: {p.stock}</div>
              <button
                className="kc-nav-logout"
                style={{ width: '100%' }}
                onClick={(e) => {
                  e.stopPropagation()
                  addToCart(p)
                }}
              >
                Beli sekarang
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Tombol floating keranjang */}
      <button
        onClick={() => setCartOpen(true)}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, var(--kc-green-light), var(--kc-green))',
          boxShadow: '0 10px 24px rgba(0,0,0,0.5)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          cursor: 'pointer',
        }}
      >
        🧺
        {cart.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#ff4757',
              color: '#fff',
              borderRadius: '50%',
              width: 20,
              height: 20,
              fontSize: 12,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {cart.reduce((sum, item) => sum + item.qty, 0)}
          </span>
        )}
      </button>

      {cartOpen && (
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
          <div className="kc-glass-card" style={{ padding: 20, width: '94%', maxWidth: 420, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '19.5px', color: '#212529' }}>Keranjang</h3>
              <button
                className="kc-nav-logout"
                onClick={() => setCartOpen(false)}
                style={{ padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>
            <Keranjang
              cart={cart}
              updateQty={updateQty}
              removeFromCart={removeFromCart}
              total={total}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paidAmount={paidAmount}
              setPaidAmount={setPaidAmount}
              changeAmount={changeAmount}
              onSave={handleSaveSale}
            />
          </div>
        </div>
      )}
    </main>
  )
}

function Keranjang({
  cart,
  updateQty,
  removeFromCart,
  total,
  paymentMethod,
  setPaymentMethod,
  paidAmount,
  setPaidAmount,
  changeAmount,
  onSave,
}) {
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {cart.length === 0 ? (
        <div style={{ fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Belum ada item</div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 8,
                gap: 8,
                padding: 8,
                backgroundColor: '#ffffff',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.08)',
                borderLeft: '4px solid var(--kc-green)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14.3px', fontWeight: 600, color: '#212529' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>Rp {item.price.toLocaleString('id-ID')}</div>
              </div>
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) => updateQty(item.id, Number(e.target.value))}
                className="kc-input"
                style={{ width: 70 }}
              />
              <div style={{ width: 80, fontSize: '12px', textAlign: 'right', color: '#212529' }}>Rp {(item.price * item.qty).toLocaleString('id-ID')}</div>
              <button
                className="kc-nav-logout"
                style={{ padding: '4px 8px' }}
                onClick={() => removeFromCart(item.id)}
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 10, fontWeight: 500, fontSize: '14px', color: '#212529' }}>Total: Rp {total.toLocaleString('id-ID')}</div>
      <div style={{ marginBottom: 10, fontSize: '13px', color: '#212529' }}>
        <div style={{ marginBottom: 4 }}>Metode Pembayaran:</div>
        <label style={{ marginRight: 12 }}>
          <input
            type="radio"
            name="payment"
            value="tunai"
            checked={paymentMethod === 'tunai'}
            onChange={() => setPaymentMethod('tunai')}
          />{' '}
          Tunai
        </label>
        <label>
          <input
            type="radio"
            name="payment"
            value="qris"
            checked={paymentMethod === 'qris'}
            onChange={() => setPaymentMethod('qris')}
          />{' '}
          QRIS
        </label>
      </div>

      {paymentMethod === 'tunai' && (
        <div style={{ marginBottom: 10, fontSize: '13px', color: '#212529' }}>
          <div style={{ marginBottom: 4 }}>Uang diterima</div>
          <input
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            className="kc-input"
          />
          <div style={{ marginTop: 4 }}>Kembalian: Rp {changeAmount.toLocaleString('id-ID')}</div>
        </div>
      )}

      {paymentMethod === 'qris' && (
        <div style={{ marginBottom: 10, fontSize: '13px', color: '#212529' }}>
          <div style={{ marginBottom: 4 }}>Scan QRIS di bawah ini:</div>
          <div
            style={{
              width: 120,
              height: 120,
              border: '1px solid rgba(0,0,0,0.08)',
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              borderRadius: 12,
              backgroundColor: '#ffffff',
            }}
          >
            Gambar QRIS
          </div>
        </div>
      )}

      <button
        onClick={onSave}
        disabled={!cart.length}
        className="kc-button-primary"
        style={{ marginTop: 8 }}
      >
        Simpan Transaksi
      </button>
    </div>
  )
}

export default KasirPage
