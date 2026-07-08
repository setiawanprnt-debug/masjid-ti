import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import type { AccountType, Transaction } from '../context/FinanceContext';
import logoSrc from '../assets/Logo_TI.png';
import logoMhSrc from '../assets/Logo_MH.png';

const Keuangan: React.FC = () => {
  const { user } = useAuth();
  const { transactions, getBalance, getBalanceBeforeDate, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'in' | 'out' | 'transfer'>('in');
  const [account, setAccount] = useState<AccountType>('bank');
  const [toAccount, setToAccount] = useState<AccountType>('bendahara');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [activeTab, setActiveTab] = useState<'jamaah' | 'bendahara'>('jamaah');

  // Filters Jamaah
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Filters Bendahara
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  const canEditKeuangan = user?.role === 'bendahara' || user?.role === 'superadmin';

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setDesc(t.description);
    setAmount(t.amount.toString());
    setType(t.type);
    setAccount(t.account);
    if (t.toAccount) setToAccount(t.toAccount);
    setTransactionDate(t.date.split('T')[0]);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      deleteTransaction(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !transactionDate) return;

    if (type === 'transfer' && account === toAccount) {
      alert('Kas asal dan tujuan tidak boleh sama!');
      return;
    }
    
    // Convert to ISO string to maintain format
    const isoDate = new Date(transactionDate).toISOString();

    const transactionData = {
      date: isoDate,
      description: desc,
      amount: parseInt(amount),
      type,
      account,
      toAccount: type === 'transfer' ? toAccount : undefined
    };

    if (editingId) {
      updateTransaction(editingId, transactionData);
      setEditingId(null);
      alert('Transaksi berhasil diupdate!');
    } else {
      addTransaction(transactionData);
      alert('Transaksi berhasil ditambahkan!');
    }
    
    setDesc('');
    setAmount('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDesc('');
    setAmount('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
  };

  // Filtered for Jamaah
  const jamaahTransactions = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, startDate, endDate]);

  // Filtered for Bendahara
  const bendaharaTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth().toString() === filterMonth && d.getFullYear().toString() === filterYear;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, filterMonth, filterYear]);

  const jamaahSaldoAwal = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return getBalanceBeforeDate(start);
  }, [startDate, getBalanceBeforeDate]);

  // Calculations for Bendahara Main Report
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const periodDate = new Date(parseInt(filterYear), parseInt(filterMonth), 1);
  const saldoAwalBulan = getBalanceBeforeDate(periodDate);
  
  const penerimaanBulan = bendaharaTransactions.reduce((acc, t) => t.type === 'in' ? acc + t.amount : acc, 0);
  const pengeluaranBulan = bendaharaTransactions.reduce((acc, t) => t.type === 'out' ? acc + t.amount : acc, 0);
  const saldoAkhirBulan = saldoAwalBulan + penerimaanBulan - pengeluaranBulan;

  // Laporan Penerimaan Breakdown
  const inTransactions = bendaharaTransactions.filter(t => t.type === 'in');
  const outTransactions = bendaharaTransactions.filter(t => t.type === 'out');

  const KopSurat = () => (
    <div className="kop-surat only-print">
      <img src={logoSrc} alt="Logo Masjid Tunas Ilmu" />
      <div className="kop-surat-text">
        <h1>YAYASAN MIFTAHUL HIDAYAH</h1>
        <h2>MASJID TUNAS ILMU</h2>
        <p>Dusun Krajan RT.03/RW.01 Desa Buluagung, Kecamatan Siliragung</p>
        <p>Kabupaten Banyuwangi, Telepon: 0813 3209 6116</p>
      </div>
      <img src={logoMhSrc} alt="Logo Yayasan Miftahul Hidayah" />
    </div>
  );

  const SignatureSection = () => {
    const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div className="signature-section only-print" style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', padding: '0 30px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '60px' }}>Mengetahui,<br/>Ketua Takmir</p>
          <p style={{ fontWeight: 'bold' }}>( .................................... )</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '60px' }}>Banyuwangi, {today}<br/>Bendahara</p>
          <p style={{ fontWeight: 'bold' }}>( .................................... )</p>
        </div>
      </div>
    );
  };

  if (!user || !['ketua', 'bendahara', 'superadmin'].includes(user.role)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="keuangan-page">
      {canEditKeuangan && (
        <div className="card no-print">
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>
          {editingId ? 'Edit Transaksi' : 'Input Transaksi Baru'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tanggal Transaksi</label>
            <input 
              type="date" 
              value={transactionDate} 
              onChange={e => setTransactionDate(e.target.value)} 
              style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Jenis Transaksi</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <option value="in">Pemasukan (+)</option>
              <option value="out">Pengeluaran (-)</option>
              <option value="transfer">Mutasi Antar Kas</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>{type === 'transfer' ? 'Dari Kas' : 'Pos Kas'}</label>
            <select value={account} onChange={(e) => setAccount(e.target.value as any)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <option value="bank">Kas di Bank</option>
              <option value="bendahara">Kas di Bendahara</option>
              <option value="ketua">Kas di Ketua</option>
            </select>
          </div>
          
          {type === 'transfer' && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Ke Kas</label>
              <select value={toAccount} onChange={(e) => setToAccount(e.target.value as any)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <option value="bank">Kas di Bank</option>
                <option value="bendahara">Kas di Bendahara</option>
                <option value="ketua">Kas di Ketua</option>
              </select>
            </div>
          )}

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Keterangan</label>
            <input 
              type="text" 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              placeholder={type === 'transfer' ? "Contoh: Pindah dana operasional ke ketua" : "Contoh: Infak Jumat"}
              style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              required 
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nominal (Rp)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="100000"
              style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              required 
            />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px', flex: 1 }}>
              {editingId ? 'Update Transaksi' : 'Simpan Transaksi'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn" style={{ padding: '10px', background: '#ccc' }}>Batal</button>
            )}
          </div>
        </form>
      </div>
      )}

      <div className="card no-print" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <button 
            className={`btn ${activeTab === 'jamaah' ? 'btn-primary' : ''}`} 
            onClick={() => setActiveTab('jamaah')}
            style={{ padding: '8px 16px', background: activeTab === 'jamaah' ? '' : '#e0e0e0', color: activeTab === 'jamaah' ? '' : '#333' }}
          >
            Laporan untuk Jamaah
          </button>
          <button 
            className={`btn ${activeTab === 'bendahara' ? 'btn-primary' : ''}`} 
            onClick={() => setActiveTab('bendahara')}
            style={{ padding: '8px 16px', background: activeTab === 'bendahara' ? '' : '#e0e0e0', color: activeTab === 'bendahara' ? '' : '#333' }}
          >
            Laporan untuk Bendahara
          </button>
        </div>
      </div>

      <div className="card print-area" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="no-print" style={{ color: 'var(--primary-color)' }}>
            {activeTab === 'jamaah' ? 'Laporan Keuangan Masjid (Jamaah)' : 'Laporan Keuangan Masjid (Bendahara)'}
          </h2>
          <button onClick={() => window.print()} className="btn btn-primary no-print">Cetak Laporan</button>
        </div>

        {activeTab === 'jamaah' ? (
          <>
            <KopSurat />
            <h3 className="only-print" style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--primary-color)' }}>Laporan Keuangan Masjid</h3>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }} className="no-print">
              <div>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Mulai Tanggal: </label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Sampai Tanggal: </label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px' }} />
              </div>
            </div>
            
            <p className="only-print" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
              Periode: {new Date(startDate).toLocaleDateString('id-ID')} s.d {new Date(endDate).toLocaleDateString('id-ID')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div style={{ background: '#f4f6f8', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--text-light)', marginBottom: '5px' }}>Kas Bank</h4>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatRupiah(getBalance('bank', new Date(endDate)))}</div>
              </div>
              <div style={{ background: '#f4f6f8', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--text-light)', marginBottom: '5px' }}>Kas Bendahara</h4>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatRupiah(getBalance('bendahara', new Date(endDate)))}</div>
              </div>
              <div style={{ background: '#f4f6f8', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--text-light)', marginBottom: '5px' }}>Kas Ketua</h4>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatRupiah(getBalance('ketua', new Date(endDate)))}</div>
              </div>
              <div className="total-balance-box" style={{ background: 'white', color: 'var(--primary-color)', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '4px solid var(--primary-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h4 style={{ marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL SALDO KAS</h4>
                <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>{formatRupiah(getBalance(undefined, new Date(endDate)))}</div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="striped-table responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary-color)', color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '12px', border: '1px solid #085f47' }}>Tanggal</th>
                    <th style={{ padding: '12px', border: '1px solid #085f47' }}>Keterangan</th>
                    <th style={{ padding: '12px', border: '1px solid #085f47' }}>Pos Kas</th>
                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #085f47' }}>Penerimaan</th>
                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #085f47' }}>Pengeluaran</th>
                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #085f47' }}>Saldo</th>
                    {canEditKeuangan && <th style={{ padding: '12px', textAlign: 'center' }} className="no-print">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', borderRight: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)' }}>
                      {new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid var(--border-color)', fontWeight: 'bold' }}>Saldo Awal</td>
                    <td style={{ padding: '12px', borderRight: '1px solid var(--border-color)' }}>-</td>
                    <td style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid var(--border-color)' }}>-</td>
                    <td style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid var(--border-color)' }}>-</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', borderRight: '1px solid var(--border-color)' }}>{formatRupiah(jamaahSaldoAwal)}</td>
                    {canEditKeuangan && <td style={{ padding: '12px' }} className="no-print"></td>}
                  </tr>
                  {(() => {
                    let runningBalanceJamaah = jamaahSaldoAwal;
                    return jamaahTransactions.length > 0 ? jamaahTransactions.map(t => {
                      if (t.type === 'in') runningBalanceJamaah += t.amount;
                      if (t.type === 'out') runningBalanceJamaah -= t.amount;
                      
                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px', borderRight: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)' }}>
                            {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '12px', borderRight: '1px solid var(--border-color)' }}>{t.description}</td>
                          <td style={{ padding: '12px', textTransform: 'capitalize', borderRight: '1px solid var(--border-color)' }}>
                            {t.type === 'transfer' ? `${t.account} -> ${t.toAccount}` : t.account}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--primary-color)', fontWeight: 'bold', borderRight: '1px solid var(--border-color)' }}>
                            {t.type === 'in' ? formatRupiah(t.amount) : '-'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--danger-color)', fontWeight: 'bold', borderRight: '1px solid var(--border-color)' }}>
                            {t.type === 'out' ? formatRupiah(t.amount) : '-'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', borderRight: '1px solid var(--border-color)' }}>
                            {formatRupiah(runningBalanceJamaah)}
                          </td>
                          {canEditKeuangan && (
                            <td style={{ padding: '12px', textAlign: 'center' }} className="no-print">
                              <button onClick={() => handleEdit(t)} style={{ background: 'none', border: 'none', color: '#17a2b8', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' }}>Edit</button>
                              <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontWeight: 'bold' }}>Hapus</button>
                            </td>
                          )}
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={canEditKeuangan ? 7 : 6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)' }}>Tidak ada transaksi pada periode ini.</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            <SignatureSection />
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }} className="no-print">
              <div>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Bulan: </label>
                <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: '6px', borderRadius: '4px' }}>
                  {monthNames.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Tahun: </label>
                <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '6px', borderRadius: '4px' }}>
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* 1. Laporan Penerimaan dan Pengeluaran Kas */}
            <div className="report-section print-page">
              <KopSurat />
              <h3 style={{ textAlign: 'center', marginBottom: '5px' }}>Laporan Penerimaan dan Pengeluaran Kas</h3>
              <p style={{ textAlign: 'center', marginBottom: '15px' }}>Periode {monthNames[parseInt(filterMonth)]} {filterYear}</p>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'left' }}>Uraian</th>
                    <th style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'right' }}>Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>Saldo Awal</td>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(saldoAwalBulan)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 'bold', backgroundColor: '#fafafa' }}>Penerimaan</td>
                  </tr>
                  {inTransactions.length > 0 ? inTransactions.map(t => (
                    <tr key={`in-${t.id}`}>
                      <td style={{ padding: '8px 10px 8px 25px', border: '1px solid var(--border-color)' }}>{t.description}</td>
                      <td style={{ padding: '8px 10px', border: '1px solid var(--border-color)', textAlign: 'right' }}>{formatRupiah(t.amount)}</td>
                    </tr>
                  )) : <tr><td colSpan={2} style={{ padding: '8px 10px 8px 25px', border: '1px solid var(--border-color)', fontStyle: 'italic', color: '#999' }}>Tidak ada penerimaan</td></tr>}
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 'bold', textAlign: 'right' }}>Total Penerimaan</td>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatRupiah(penerimaanBulan)}</td>
                  </tr>
                  
                  <tr>
                    <td colSpan={2} style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 'bold', backgroundColor: '#fafafa' }}>Pengeluaran</td>
                  </tr>
                  {outTransactions.length > 0 ? outTransactions.map(t => (
                    <tr key={`out-${t.id}`}>
                      <td style={{ padding: '8px 10px 8px 25px', border: '1px solid var(--border-color)' }}>{t.description}</td>
                      <td style={{ padding: '8px 10px', border: '1px solid var(--border-color)', textAlign: 'right' }}>{formatRupiah(t.amount)}</td>
                    </tr>
                  )) : <tr><td colSpan={2} style={{ padding: '8px 10px 8px 25px', border: '1px solid var(--border-color)', fontStyle: 'italic', color: '#999' }}>Tidak ada pengeluaran</td></tr>}
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 'bold', textAlign: 'right' }}>Total Pengeluaran</td>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 'bold', color: 'var(--danger-color)' }}>{formatRupiah(pengeluaranBulan)}</td>
                  </tr>
                  
                  <tr style={{ backgroundColor: '#eef8f5' }}>
                    <td style={{ padding: '12px 10px', border: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>Saldo Akhir</td>
                    <td style={{ padding: '12px 10px', border: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatRupiah(saldoAkhirBulan)}</td>
                  </tr>
                </tbody>
              </table>
              <SignatureSection />
            </div>

            {/* 2. Buku Kas Umum */}
            <div className="report-section print-page">
              <KopSurat />
              <h3 style={{ textAlign: 'center', marginBottom: '5px' }}>Buku Kas Umum</h3>
              <p style={{ textAlign: 'center', marginBottom: '15px' }}>Periode {monthNames[parseInt(filterMonth)]} {filterYear}</p>
              
              <table className="striped-table responsive-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
                    <th style={{ padding: '10px', border: '1px solid #085f47', textAlign: 'center' }}>Tgl</th>
                    <th style={{ padding: '10px', border: '1px solid #085f47', textAlign: 'left' }}>Uraian</th>
                    <th style={{ padding: '10px', border: '1px solid #085f47', textAlign: 'right' }}>Penerimaan</th>
                    <th style={{ padding: '10px', border: '1px solid #085f47', textAlign: 'right' }}>Pengeluaran</th>
                    <th style={{ padding: '10px', border: '1px solid #085f47', textAlign: 'right' }}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>01/{String(parseInt(filterMonth)+1).padStart(2, '0')}</td>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>Saldo Awal</td>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'right' }}></td>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'right' }}></td>
                    <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(saldoAwalBulan)}</td>
                  </tr>
                  {(() => {
                    let runningBalance = saldoAwalBulan;
                    return bendaharaTransactions.map(t => {
                      if (t.type === 'in') runningBalance += t.amount;
                      if (t.type === 'out') runningBalance -= t.amount;
                      // Transfer doesn't affect total balance, only pos kas. We log it for transparency if needed, but usually Buku Kas Umum is total.
                      // Let's include transfers with 0 effect on total balance but describe them.
                      
                      const tgl = new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
                      
                      return (
                        <tr key={`bku-${t.id}`}>
                          <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>{tgl}</td>
                          <td style={{ padding: '8px', border: '1px solid var(--border-color)' }}>
                            {t.description} {t.type === 'transfer' ? `(Mutasi: ${t.account} -> ${t.toAccount})` : ''}
                          </td>
                          <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'right' }}>{t.type === 'in' ? formatRupiah(t.amount) : ''}</td>
                          <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'right' }}>{t.type === 'out' ? formatRupiah(t.amount) : ''}</td>
                          <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'right' }}>{formatRupiah(runningBalance)}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
              <SignatureSection />
            </div>

            {/* 3. Laporan Saldo Kas & Mutasi */}
            <div className="report-section print-page">
              <KopSurat />
              <h3 style={{ textAlign: 'center', marginBottom: '5px' }}>Laporan Saldo Kas</h3>
              <p style={{ textAlign: 'center', marginBottom: '15px' }}>
                Per {new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'left' }}>Jenis Kas</th>
                    <th style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'right' }}>Saldo (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Kas Bank</td>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'right' }}>{formatRupiah(getBalance('bank', new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0)))}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Kas Bendahara</td>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'right' }}>{formatRupiah(getBalance('bendahara', new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0)))}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Kas Operasional Ketua</td>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'right' }}>{formatRupiah(getBalance('ketua', new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0)))}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#eef8f5' }}>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>Total Saldo Kas</td>
                    <td style={{ padding: '10px', border: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(getBalance(undefined, new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0)))}</td>
                  </tr>
                </tbody>
              </table>
              
              <h3 style={{ textAlign: 'center', marginTop: '30px', marginBottom: '5px' }}>Laporan Mutasi Kas</h3>
              <p style={{ textAlign: 'center', marginBottom: '15px' }}>
                Per {new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              <table className="striped-table responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
                    <th style={{ padding: '10px', border: '1px solid #085f47', textAlign: 'center' }}>Tanggal</th>
                    <th style={{ padding: '10px', border: '1px solid #085f47', textAlign: 'center' }}>Dari</th>
                    <th style={{ padding: '10px', border: '1px solid #085f47', textAlign: 'center' }}>Ke</th>
                    <th style={{ padding: '10px', border: '1px solid #085f47', textAlign: 'right' }}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {bendaharaTransactions.filter(t => t.type === 'transfer').length > 0 ? (
                    bendaharaTransactions.filter(t => t.type === 'transfer').map(t => (
                      <tr key={`mutasi-${t.id}`}>
                        <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                          {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'center', textTransform: 'capitalize' }}>{t.account}</td>
                        <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'center', textTransform: 'capitalize' }}>{t.toAccount}</td>
                        <td style={{ padding: '8px', border: '1px solid var(--border-color)', textAlign: 'right' }}>{formatRupiah(t.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '15px', textAlign: 'center', fontStyle: 'italic', color: '#999', border: '1px solid var(--border-color)' }}>
                        Tidak ada mutasi kas pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <SignatureSection />
            </div>
          </>
        )}
      </div>

      <style>{`
        .striped-table tbody tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .only-print {
          display: none;
        }
        
        @media screen {
          .responsive-table {
            min-width: 700px;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; }
          .no-print { display: none !important; }
          .only-print { display: block; }
          
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr { page-break-inside: avoid; }
          
          table th, table td {
            font-size: 11px !important;
            padding: 6px !important;
          }
          
          .print-page {
            page-break-after: always;
            margin-bottom: 20px;
            padding-bottom: 20px;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          
          .kop-surat {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid black;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          
          .kop-surat img {
            width: 80px;
            height: auto;
          }
          
          .kop-surat-text {
            text-align: center;
            flex: 1;
            padding: 0 15px;
          }

           .kop-surat-text h1 {
            margin: 0 0 5px 0;
            font-size: 20px;
            color: black !important;
          }
          
          .kop-surat-text h2 {
            margin: 0 0 5px 0;
            font-size: 24px;
            color: green  !important;
          }
          
          .kop-surat-text p {
            margin: 0;
            font-size: 14px;
          }

          .total-balance-box {
            background-color: white !important;
            color: #0b7c5e !important;
            border: 4px solid #0b7c5e !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          table {
            width: 100% !important;
            min-width: 0 !important;
          }

          table th {
            background-color: #0b7c5e !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .striped-table tbody tr:nth-child(even) {
            background-color: #f2f2f2 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default Keuangan;
