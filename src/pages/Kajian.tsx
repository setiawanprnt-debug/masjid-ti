import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import EditableContent from '../components/EditableContent';

const Kajian: React.FC = () => {
  const { user } = useAuth();
  const { content, updateArrayContent, addArrayContent, removeArrayContent } = useContent();
  
  // All logged-in users can edit Kajian
  const canEditKajian = !!user;

  return (
    <div className="kajian-page">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: 'var(--primary-color)' }}>Jadwal Kajian</h2>
          {canEditKajian && (
            <button onClick={() => addArrayContent('jadwal')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
              + Tambah Jadwal
            </button>
          )}
        </div>
        
        {content.jadwal.length === 0 && <p style={{ color: 'var(--text-light)' }}>Belum ada jadwal kajian.</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {content.jadwal.map((jadwalText, index) => (
            <div key={index} style={{ position: 'relative', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fafafa' }}>
              <EditableContent 
                content={jadwalText} 
                onSave={(val) => updateArrayContent('jadwal', index, val)} 
                canEdit={canEditKajian} 
                placeholder="Tulis detail jadwal kajian di sini..."
              />
              {canEditKajian && (
                <button onClick={() => removeArrayContent('jadwal', index)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  ❌ Hapus
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: 'var(--primary-color)' }}>Ringkasan Materi Kajian</h2>
          {canEditKajian && (
            <button onClick={() => addArrayContent('ringkasan')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
              + Tambah Ringkasan
            </button>
          )}
        </div>
        
        {content.ringkasan.length === 0 && <p style={{ color: 'var(--text-light)' }}>Belum ada ringkasan materi.</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {content.ringkasan.map((ringkasanText, index) => (
            <div key={index} style={{ position: 'relative', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fafafa' }}>
              <EditableContent 
                content={ringkasanText} 
                onSave={(val) => updateArrayContent('ringkasan', index, val)} 
                canEdit={canEditKajian} 
                placeholder="Tulis ringkasan materi di sini..."
              />
              {canEditKajian && (
                <button onClick={() => removeArrayContent('ringkasan', index)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  ❌ Hapus
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Kajian;
