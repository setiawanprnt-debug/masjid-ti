import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

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
            <div className="user-info">
              <span className="welcome-text">Hi, {user.username} ({user.role})</span>
              <button className="btn-logout" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </button>
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
