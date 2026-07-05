import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface BeritaItem {
  id: string;
  judul: string;
  konten: string;
  created_at: string;
}

interface BeritaContextType {
  beritaList: BeritaItem[];
  addBerita: (judul: string, konten: string) => Promise<void>;
  updateBerita: (id: string, judul: string, konten: string) => Promise<void>;
  deleteBerita: (id: string) => Promise<void>;
}

const BeritaContext = createContext<BeritaContextType | undefined>(undefined);

export const BeritaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [beritaList, setBeritaList] = useState<BeritaItem[]>([]);

  useEffect(() => {
    fetchBerita();

    const channel = supabase
      .channel('public:berita')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'berita' }, _payload => {
        fetchBerita();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBerita = async () => {
    const { data, error } = await supabase
      .from('berita')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching berita:', error);
      return;
    }
    
    if (data) setBeritaList(data as BeritaItem[]);
  };

  const addBerita = async (judul: string, konten: string) => {
    const { error } = await supabase.from('berita').insert([{ judul, konten }]);
    if (error) {
      console.error('Error adding berita:', error);
      alert('Gagal menambah berita: ' + error.message);
    }
  };

  const updateBerita = async (id: string, judul: string, konten: string) => {
    const { error } = await supabase.from('berita').update({ judul, konten, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      console.error('Error updating berita:', error);
      alert('Gagal update berita: ' + error.message);
    }
  };

  const deleteBerita = async (id: string) => {
    const { error } = await supabase.from('berita').delete().eq('id', id);
    if (error) {
      console.error('Error deleting berita:', error);
      alert('Gagal hapus berita: ' + error.message);
    }
  };

  return (
    <BeritaContext.Provider value={{ beritaList, addBerita, updateBerita, deleteBerita }}>
      {children}
    </BeritaContext.Provider>
  );
};

export const useBerita = () => {
  const context = useContext(BeritaContext);
  if (!context) {
    throw new Error('useBerita must be used within a BeritaProvider');
  }
  return context;
};
