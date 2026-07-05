import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Role } from '../types';

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

const Pengaturan: React.FC = () => {
  const { user } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_user_list');
      
      // Fallback if RPC fails or returns nothing
      if (error || !data || data.length === 0) {
        const { data: rolesData, error: rolesError } = await supabase.from('user_roles').select('*');
        if (!rolesError && rolesData && rolesData.length > 0) {
          const fallbackData = rolesData.map((r: any) => ({
            id: r.user_id,
            email: r.email || `(Akun ID: ${r.user_id.substring(0,8)}...)`, // Display ID if email is not available
            role: r.role
          }));
          setUsersList(fallbackData);
          setLoadingUsers(false);
          return;
        }
      }

      if (error) throw error;
      setUsersList(data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/" />;
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formattedEmail = `${newUsername.toLowerCase().trim()}@masjidti.com`;
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdminMode = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data, error } = await supabaseAdminMode.auth.signUp({
        email: formattedEmail,
        password: newPassword,
      });

      if (error) throw error;

      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ user_id: data.user.id, role: newRole }]);

        if (roleError) throw roleError;

        setMessage(`User ${newUsername} berhasil dibuat dengan role ${newRole}!`);
        setNewUsername('');
        setNewPassword('');
        fetchUsers();
      }
    } catch (err: any) {
      setMessage('Gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    const newPwd = prompt(`Masukkan password baru untuk ${email} (minimal 6 karakter):`);
    if (!newPwd || newPwd.length < 6) {
      if (newPwd) alert('Password harus minimal 6 karakter!');
      return;
    }
    
    try {
      const { error } = await supabase.rpc('admin_reset_password', { target_id: userId, new_password: newPwd });
      if (error) throw error;
      alert(`Password untuk ${email} berhasil direset!`);
    } catch (err: any) {
      alert('Gagal mereset password: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (userId === user.id) {
      alert('Anda tidak bisa menghapus akun Anda sendiri saat sedang login!');
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin MENGHAPUS akun ${email}? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const { error } = await supabase.rpc('admin_delete_user', { target_id: userId });
        if (error) throw error;
        alert(`Akun ${email} berhasil dihapus.`);
        fetchUsers();
      } catch (err: any) {
        alert('Gagal menghapus akun: ' + err.message);
      }
    }
  };

  return (
    <div className="pengaturan-page">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Form Tambah User */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Tambah Akun Baru</h2>
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
                <option value="superadmin">Admin (Superadmin)</option>
                <option value="bendahara">Bendahara</option>
                <option value="ketua">Ketua</option>
                <option value="user">User Biasa</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Memproses...' : 'Buat Akun'}
            </button>
          </form>
        </div>

        {/* Daftar User */}
        <div className="card">
          <h2 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Daftar Akun Terdaftar</h2>
          
          {loadingUsers ? (
            <p>Memuat daftar akun...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email / Username</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Role</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px' }}>{u.email}</td>
                      <td style={{ padding: '10px', textTransform: 'capitalize' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          backgroundColor: u.role === 'superadmin' ? '#ffeeba' : '#e2e3e5',
                          fontWeight: 'bold'
                        }}>
                          {u.role === 'superadmin' ? 'Admin' : u.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleResetPassword(u.id, u.email)}
                          style={{ background: 'none', border: 'none', color: '#17a2b8', cursor: 'pointer', marginRight: '10px', fontSize: '0.85rem' }}
                          title="Reset Password"
                        >
                          Reset Pwd
                        </button>
                        {u.id !== user.id && (
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.85rem' }}
                            title="Hapus Akun"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: '15px', textAlign: 'center', color: '#888' }}>
                        Tidak ada data akun.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
