import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface EditableContentProps {
  content: string;
  onSave: (val: string) => void;
  canEdit: boolean;
  placeholder?: string;
}

const EditableContent: React.FC<EditableContentProps> = ({ content, onSave, canEdit, placeholder = '(Belum ada data)' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  const renderContent = (text: string) => {
    if (!text || text === '<p><br></p>') return <p style={{ color: 'var(--text-light)' }}><em>{placeholder}</em></p>;
    
    // Convert old markdown image to HTML image if needed
    let processedText = text;
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    processedText = processedText.replace(imgRegex, '<img src="$2" alt="$1" style="max-width:100%; border-radius:8px;"/>');
    
    return (
      <div 
        className="ql-editor" 
        style={{ padding: 0 }}
        dangerouslySetInnerHTML={{ __html: processedText }} 
      />
    );
  };

  if (isEditing) {
    return (
      <div style={{ marginTop: '10px' }}>
        <ReactQuill 
          theme="snow"
          value={value} 
          onChange={setValue} 
          modules={modules}
          formats={formats}
          style={{ background: 'white' }}
        />
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '5px 15px', fontSize: '0.85rem' }}>Simpan</button>
          <button onClick={() => setIsEditing(false)} className="btn" style={{ padding: '5px 15px', fontSize: '0.85rem', background: '#eaeaea', color: '#333' }}>Batal</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '10px', position: 'relative' }}>
      {canEdit && (
        <button 
          onClick={() => { setValue(content); setIsEditing(true); }}
          style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', zIndex: 10 }}
        >
          ✏️ Edit Konten
        </button>
      )}
      {renderContent(content)}
    </div>
  );
};

export default EditableContent;
