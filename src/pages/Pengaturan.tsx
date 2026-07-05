import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Role } from '../types';

const Pengaturan: React.FC = () => {
  const { user } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [changePassword, setChangePassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState('');

  if (!user) {
    return <Navigate to="/" />;
  }

  const isSuperadmin = user.role === 'superadmin';

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) return;
    setLoading(true);
    setMessage('');

    try {
      const formattedEmail = `${newUsername.toLowerCase().trim()}@masjidti.com`;
      
      // Create alternative client that doesn't persist session so admin doesn't get logged out
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdminMode = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      // Create user
      const { data, error } = await supabaseAdminMode.auth.signUp({
        email: formattedEmail,
        password: newPassword,
      });

      if (error) throw error;

      if (data.user) {
        // Insert role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ user_id: data.user.id, role: newRole }]);

        if (roleError) throw roleError;

        setMessage(`User ${newUsername} berhasil dibuat dengan role ${newRole}!`);
        setNewUsername('');
        setNewPassword('');
      }
    } catch (err: any) {
      setMessage('Gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: changePassword
      });

      if (error) throw error;
      setPassMessage('Password berhasil diubah!');
      setChangePassword('');
    } catch (err: any) {
      setPassMessage('Gagal ubah password: ' + err.message);
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="pengaturan-page">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Form Ubah Password (Semua User) */}
        <div className="card">
          <h2 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Ubah Password Anda</h2>
          {passMessage && <div style={{ padding: '10px', backgroundColor: passMessage.includes('Gagal') ? '#f8d7da' : '#d4edda', marginBottom: '15px', borderRadius: '5px' }}>{passMessage}</div>}
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Password Baru</label>
              <input 
                type="password" 
                value={changePassword}
                onChange={e => setChangePassword(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={passLoading}>
              {passLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        </div>

        {/* Form Tambah User (Hanya Superadmin) */}
        {isSuperadmin && (
          <div className="card">
            <h2 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Tambah User Baru (Admin)</h2>
            {message && <div style={{ padding: '10px', backgroundColor: message.includes('Gagal') ? '#f8d7da' : '#d4edda', marginBottom: '15px', borderRadius: '5px' }}>{message}</div>}
            
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Password Baru</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  required
                  minLength={6}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
                <select 
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as Role)}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                >
                  <option value="superadmin">Superadmin</option>
                  <option value="bendahara">Bendahara</option>
                  <option value="ketua">Ketua</option>
                  <option value="user">User Biasa</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Memproses...' : 'Buat Akun'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pengaturan;
