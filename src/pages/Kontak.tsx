import React from 'react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import EditableContent from '../components/EditableContent';

const Kontak: React.FC = () => {
  const { content, updateContent } = useContent();
  const { user } = useAuth();
  const canEdit = ['ketua', 'bendahara', 'superadmin'].includes(user?.role || '');

  // Default contact info if none exists in db yet
  const defaultKontak = `
<p><strong>Alamat masjid:</strong> Dusun Krajan RT.03/RW.01, Desa Buluagung, Kecamatan Siliragung, Kabupaten Banyuwangi, Jawa Timur</p>
<p><strong>Map:</strong> <a href="https://goo.gl/maps/HZNPgsrGyWGM9sEo6?g_st=awb" target="_blank" rel="noopener noreferrer">Buka di Google Maps</a></p>
<p><strong>Nomer wa:</strong> 0813 3209 6116</p>
<p><strong>Nomer rekening:</strong> Bank Syariah Indonesia (BSI) 1240320211 a.n. Miftahul Hidayah Banyuwangi</p>
  `.trim();

  const handleSave = (newVal: string) => {
    updateContent('kontak', newVal);
  };

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div className="card">
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>Kontak Kami</h2>
        
        <EditableContent 
          content={content.kontak || defaultKontak} 
          onSave={handleSave} 
          canEdit={canEdit} 
        />
        
        <div style={{ marginTop: '30px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
          {/* Map Embed (optional, as an extra nice touch) */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.326269202652!2d114.120536!3d-8.564555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd3ff98d57b2867%3A0xc33e5b38edb37f48!2sMasjid%20Tunas%20Ilmu!5e0!3m2!1sen!2sid!4v1711111111111!5m2!1sen!2sid" 
            width="100%" 
            height="350" 
            style={{ border: 0, display: 'block' }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Kontak;
