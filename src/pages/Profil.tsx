import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import EditableContent from '../components/EditableContent';

const Profil: React.FC = () => {
  const { user } = useAuth();
  const { content, updateContent } = useContent();
  const canEditProfil = ['ketua', 'bendahara', 'superadmin'].includes(user?.role || '');


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

    </div>
  );
};

export default Profil;
