import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, X, Search, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password baru harus minimal 6 karakter!');
      return;
    }
    setIsChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsChangingPwd(false);

    if (error) {
      alert('Gagal merubah password: ' + error.message);
    } else {
      alert('Password berhasil diubah!');
      setNewPassword('');
      setShowResetPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar-wrapper">
      <div className="container navbar-container">
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>BERANDA</NavLink>
          <NavLink to="/profil" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>PROFIL</NavLink>
          <NavLink to="/kajian" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>KAJIAN</NavLink>
          <NavLink to="/berita" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>BERITA</NavLink>
          <NavLink to="/kontak" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>KONTAK</NavLink>
          
          {(user?.role === 'ketua' || user?.role === 'bendahara' || user?.role === 'superadmin') && (
            <NavLink to="/keuangan" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>KEUANGAN</NavLink>
          )}
          
          {user?.role === 'superadmin' && (
            <NavLink to="/pengaturan" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>PENGATURAN</NavLink>
          )}
        </div>

        <div className="nav-actions">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <button className="search-btn"><Search size={18} /></button>
          </div>
          
          {user ? (
            <div className="user-info" style={{ position: 'relative' }}>
              <span 
                className="welcome-text" 
                onClick={() => setShowResetPassword(!showResetPassword)}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                title="Klik untuk reset password"
              >
                Hi, {user.username} ({user.role})
              </span>
              <button className="btn-logout" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </button>
              
              {showResetPassword && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  padding: '15px',
                  borderRadius: '5px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  width: '250px',
                  marginTop: '10px'
                }}>
                  <h4 style={{ marginBottom: '10px', color: 'var(--primary-color)' }}>Reset Password</h4>
                  <form onSubmit={handleChangePassword}>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    />
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.9rem' }} disabled={isChangingPwd}>
                        {isChangingPwd ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button type="button" className="btn" style={{ padding: '8px', fontSize: '0.9rem', backgroundColor: '#e0e0e0', color: '#333' }} onClick={() => setShowResetPassword(false)}>
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-login" onClick={() => navigate('/login')} title="Login">
              <LogIn size={20} />
              <span>LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
