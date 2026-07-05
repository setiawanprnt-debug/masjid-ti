import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Profil from './pages/Profil';
import Kajian from './pages/Kajian';
import Keuangan from './pages/Keuangan';
import Pengaturan from './pages/Pengaturan';
import Berita from './pages/Berita';
import Kontak from './pages/Kontak';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="profil" element={<Profil />} />
        <Route path="kajian" element={<Kajian />} />
        <Route path="keuangan" element={<Keuangan />} />
        <Route path="berita" element={<Berita />} />
        <Route path="kontak" element={<Kontak />} />
        <Route path="pengaturan" element={<Pengaturan />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
