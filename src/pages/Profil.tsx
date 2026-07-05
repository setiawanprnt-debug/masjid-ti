import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import EditableContent from '../components/EditableContent';

const Profil: React.FC = () => {
  const { user } = useAuth();
  const { content, updateContent } = useContent();
  const canEditProfil = ['ketua', 'bendahara', 'superadmin'].includes(user?.role || '');

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
    }
  };

  return (
    <div className="profil-page">
      <div className="card" style={{ position: 'relative' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Sejarah Masjid</h2>
        <EditableContent 
          content={content.sejarah} 
          onSave={(val) => updateContent('sejarah', val)} 
          canEdit={canEditProfil} 
        />
      </div>

      <div className="card" style={{ position: 'relative' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Visi & Misi</h2>
        <EditableContent 
          content={content.visiMisi} 
          onSave={(val) => updateContent('visiMisi', val)} 
          canEdit={canEditProfil} 
        />
      </div>

      <div className="card" style={{ position: 'relative' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Struktur Pengurus</h2>
        <EditableContent 
          content={content.struktur} 
          onSave={(val) => updateContent('struktur', val)} 
          canEdit={canEditProfil} 
        />
      </div>

      {user && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h2 style={{ color: 'var(--primary-color)' }}>Pengaturan Akun</h2>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '15px' }}>
            <div style={{ flex: 1, maxWidth: '300px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Password Baru</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isChangingPwd}>
              {isChangingPwd ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profil;
