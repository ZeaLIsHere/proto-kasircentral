import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'

function LaporanPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({ total: 0, count: 0 })
  const [details, setDetails] = useState([])

  const loadSummary = async (selectedDate) => {
    setLoading(true)
    try {
      const q = query(collection(db, 'sales'), where('date', '==', selectedDate))
      const snap = await getDocs(q)
      let total = 0
      let count = 0
      const salesDetails = []
      
      snap.forEach((d) => {
        const data = d.data()
        total += data.total || 0
        count += 1
        salesDetails.push({
          id: d.id,
          ...data,
          time: data.createdAt?.toDate?.() || null,
        })
      })

      salesDetails.sort((a, b) => {
        const ta = a.time?.getTime?.() || 0
        const tb = b.time?.getTime?.() || 0
        return tb - ta
      })
      
      setSummary({ total, count })
      setDetails(salesDetails)
    } catch (e) {
      console.error(e)
      setSummary({ total: 0, count: 0 })
      setDetails([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary(date)
  }, [])

  const handleChangeDate = (e) => {
    const newDate = e.target.value
    setDate(newDate)
    loadSummary(newDate)
  }

  const avg = summary.count ? Math.round(summary.total / summary.count) : 0

  const formatTime = (date) => {
    if (!date) return '-'
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const exportToCSV = () => {
    const headers = ['Waktu', 'Kasir', 'Item', 'Total', 'Metode']
    const rows = details.map(sale => [
      formatTime(sale.time),
      sale.cashierNameSnapshot || '-',
      sale.items?.length || 0,
      sale.total || 0,
      sale.paymentMethod || '-'
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan_penjualan_${date}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    const data = details.map(sale => ({
      waktu: formatTime(sale.time),
      kasir: sale.cashierNameSnapshot || '-',
      items: sale.items || [],
      total: sale.total || 0,
      metode: sale.paymentMethod || '-'
    }))
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan_penjualan_${date}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="kc-main">
      <div className="kc-glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '23.4px', color: '#212529' }}>Laporan Penjualan</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="kc-nav-logout" onClick={exportToCSV}>
              📊 Export CSV
            </button>
            <button className="kc-nav-logout" onClick={exportToJSON}>
              📄 Export JSON
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="kc-label" style={{ display: 'inline-block', marginRight: 8 }}>
            Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={handleChangeDate}
            className="kc-input"
            style={{ maxWidth: 200, display: 'inline-block' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>Memuat laporan...</div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div className="kc-glass-card" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: 4 }}>Total Transaksi</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#212529' }}>{summary.count}</div>
              </div>
              <div className="kc-glass-card" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: 4 }}>Total Omzet</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#212529' }}>
                  Rp {summary.total.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="kc-glass-card" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: 4 }}>Rata-rata</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#212529' }}>
                  Rp {avg.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {details.length > 0 ? (
              <div>
                <h3 style={{ fontSize: '19.5px', marginBottom: 12, color: '#212529' }}>Detail Transaksi</h3>
                <div
                  style={{
                    maxHeight: 400,
                    overflowY: 'auto',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 12,
                    background: '#ffffff',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa' }}>
                      <tr>
                        <th
                          style={{
                            padding: 12,
                            textAlign: 'left',
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                          }}
                        >
                          Waktu
                        </th>
                        <th
                          style={{
                            padding: 12,
                            textAlign: 'left',
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                          }}
                        >
                          Kasir
                        </th>
                        <th
                          style={{
                            padding: 12,
                            textAlign: 'right',
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                          }}
                        >
                          Item
                        </th>
                        <th
                          style={{
                            padding: 12,
                            textAlign: 'right',
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                          }}
                        >
                          Total
                        </th>
                        <th
                          style={{
                            padding: 12,
                            textAlign: 'center',
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                          }}
                        >
                          Metode
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((sale, idx) => (
                        <tr
                          key={sale.id}
                          style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa' }}
                        >
                          <td style={{ padding: 12 }}>{formatTime(sale.time)}</td>
                          <td style={{ padding: 12 }}>{sale.cashierNameSnapshot || '-'}</td>
                          <td style={{ padding: 12, textAlign: 'right' }}>{sale.items?.length || 0}</td>
                          <td style={{ padding: 12, textAlign: 'right', fontWeight: 500 }}>
                            Rp {(sale.total || 0).toLocaleString('id-ID')}
                          </td>
                          <td style={{ padding: 12, textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: 999,
                                fontSize: '12px',
                                background: sale.paymentMethod === 'tunai' ? '#d4edda' : '#cce5ff',
                                color: sale.paymentMethod === 'tunai' ? '#155724' : '#004085',
                              }}
                            >
                              {sale.paymentMethod || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: '#6c757d' }}>
                Belum ada transaksi untuk tanggal ini.
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default LaporanPage
