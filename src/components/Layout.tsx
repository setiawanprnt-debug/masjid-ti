import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <>
      <Header />
      <Navbar />
      <main className="container" style={{ marginTop: '20px', minHeight: 'calc(100vh - 200px)' }}>
        <Outlet />
      </main>
      <footer style={{ backgroundColor: '#085f47', color: 'white', textAlign: 'center', padding: '20px', marginTop: '40px' }}>
        <p>&copy; 2026 Masjid Tunas Ilmu. Dusun Krajan RT.03/RW.01 Desa Buluagung, Kecamatan Siliragung, Kabupaten Banyuwangi. Telepon: 0813 3209 6116.</p>
      </footer>
    </>
  );
};

export default Layout;
