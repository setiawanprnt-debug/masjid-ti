import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import EditableContent from '../components/EditableContent';
import './Home.css';

const Home: React.FC = () => {
  const { transactions, getBalance } = useFinance();
  const { user } = useAuth();
  const { content, updateContent, setFirstArrayContent } = useContent();
  
  const isSuperadmin = user?.role === 'superadmin';

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <div style={{ fontFamily: 'Amiri, "Traditional Arabic", "Scheherazade New", serif', fontSize: '2.5rem', marginBottom: '15px', fontWeight: 'normal', lineHeight: '1' }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </div>
          <h1>Selamat Datang di Website Resmi</h1>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '10px' }}>Masjid Tunas Ilmu – Banyuwangi</p>
        </div>
      </div>

      <div className="home-grid">
        <div className="main-content">
          <div className="card" style={{ position: 'relative' }}>
            <h2 style={{ color: 'var(--primary-color)' }}>Sejarah Singkat</h2>
            <EditableContent 
              content={content.sejarah} 
              onSave={(val) => updateContent('sejarah', val)} 
              canEdit={isSuperadmin} 
            />
          </div>
          <div className="card" style={{ position: 'relative' }}>
            <h2 style={{ color: 'var(--primary-color)' }}>Visi & Misi</h2>
            <EditableContent 
              content={content.visiMisi} 
              onSave={(val) => updateContent('visiMisi', val)} 
              canEdit={isSuperadmin} 
            />
          </div>
          <div className="card" style={{ position: 'relative' }}>
            <h2 style={{ color: 'var(--primary-color)' }}>Jadwal Kajian Terdekat</h2>
            <EditableContent 
              content={content.jadwal.length > 0 ? content.jadwal[0] : ''} 
              onSave={(val) => setFirstArrayContent('jadwal', val)} 
              canEdit={isSuperadmin} 
            />
          </div>
        </div>

        <div className="sidebar">
          <div className="card finance-widget">
            <h3>Total Saldo Kas</h3>
            <div className="balance-amount">{formatRupiah(getBalance())}</div>
            
            <h4 style={{marginTop: '20px', marginBottom: '10px'}}>10 Transaksi Terakhir</h4>
            {recentTransactions.length > 0 ? (
              <ul className="transaction-list">
                {recentTransactions.map(t => (
                  <li key={t.id} className="transaction-item">
                    <div className="transaction-info">
                      <strong>{t.description}</strong>
                      <span>{new Date(t.date).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className={`transaction-amount ${t.type === 'transfer' ? 'out' : t.type}`}>
                      {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-light)' }}>Belum ada transaksi</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
