import React, { useState } from 'react';
import { useBerita } from '../context/BeritaContext';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Berita: React.FC = () => {
  const { beritaList, addBerita, updateBerita, deleteBerita } = useBerita();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [judul, setJudul] = useState('');
  const [konten, setKonten] = useState('');
  const [loading, setLoading] = useState(false);

  const canEdit = !!user;

  const handleAddNew = () => {
    setEditId(null);
    setJudul('');
    setKonten('');
    setIsEditing(true);
  };

  const handleEdit = (berita: any) => {
    setEditId(berita.id);
    setJudul(berita.judul);
    setKonten(berita.konten);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus berita ini?')) {
      await deleteBerita(id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !konten) return alert('Judul dan konten tidak boleh kosong!');
    setLoading(true);
    if (editId) {
      await updateBerita(editId, judul, konten);
    } else {
      await addBerita(judul, konten);
    }
    setLoading(false);
    setIsEditing(false);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  if (isEditing) {
    return (
      <div className="container" style={{ marginTop: '20px' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>{editId ? 'Edit Berita' : 'Tambah Berita'}</h2>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Judul Berita</label>
            <input 
              type="text" 
              value={judul} 
              onChange={e => setJudul(e.target.value)} 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1.2rem' }}
              placeholder="Ketik judul berita di sini..."
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Konten Berita</label>
            <ReactQuill 
              theme="snow"
              value={konten} 
              onChange={setKonten} 
              modules={modules}
              style={{ background: 'white', minHeight: '300px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Berita'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn" style={{ background: '#ddd' }}>
              Batal
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Berita & Artikel</h2>
        {canEdit && (
          <button onClick={handleAddNew} className="btn btn-primary">
            + Tambah Berita
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {beritaList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '40px' }}>Belum ada berita.</p>
        ) : (
          beritaList.map(berita => (
            <div key={berita.id} className="card" style={{ position: 'relative' }}>
              {canEdit && (
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEdit(berita)} className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#e0f2fe', color: '#0284c7' }}>Edit</button>
                  <button onClick={() => handleDelete(berita.id)} className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#fee2e2', color: '#dc2626' }}>Hapus</button>
                </div>
              )}
              <h3 style={{ fontSize: '1.5rem', marginBottom: '5px', paddingRight: canEdit ? '100px' : '0' }}>{berita.judul}</h3>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '15px' }}>
                {new Date(berita.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div 
                className="ql-editor" 
                style={{ padding: 0 }}
                dangerouslySetInnerHTML={{ __html: berita.konten }} 
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Berita;
