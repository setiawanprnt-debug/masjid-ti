import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ContentData {
  sejarah: string;
  visiMisi: string;
  struktur: string;
  jadwal: string[];
  ringkasan: string[];
  kontak: string;
}

interface ContentContextType {
  content: ContentData;
  updateContent: (key: keyof ContentData, value: string) => Promise<void>;
  updateArrayContent: (key: keyof ContentData, index: number, value: string) => Promise<void>;
  addArrayContent: (key: keyof ContentData) => Promise<void>;
  removeArrayContent: (key: keyof ContentData, index: number) => Promise<void>;
  setFirstArrayContent: (key: keyof ContentData, value: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentData>({
    sejarah: '',
    visiMisi: '',
    struktur: '',
    jadwal: [],
    ringkasan: [],
    kontak: ''
  });

  useEffect(() => {
    fetchContent();

    const channel = supabase
      .channel('public:app_content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_content' }, _payload => {
        fetchContent();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase.from('app_content').select('*');
    if (error) {
      console.error('Error fetching content:', error);
      return;
    }

    if (data) {
      const newContent: any = {
        sejarah: '',
        visiMisi: '',
        struktur: '',
        jadwal: [],
        ringkasan: [],
        kontak: ''
      };

      data.forEach(item => {
        try {
          if (item.id === 'jadwal' || item.id === 'ringkasan') {
            newContent[item.id] = JSON.parse(item.content_text);
          } else {
            newContent[item.id] = item.content_text;
          }
        } catch (e) {
          if (item.id === 'jadwal' || item.id === 'ringkasan') {
            newContent[item.id] = [item.content_text];
          }
        }
      });
      setContent(newContent);
    }
  };

  const saveToSupabase = async (key: keyof ContentData, value: any) => {
    const contentText = (key === 'jadwal' || key === 'ringkasan') ? JSON.stringify(value) : value;
    
    const { error } = await supabase
      .from('app_content')
      .upsert({ id: key, content_text: contentText });

    if (error) {
      console.error('Error saving content:', error);
      alert('Gagal menyimpan konten: ' + error.message);
    }
  };

  const updateContent = async (key: keyof ContentData, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
    await saveToSupabase(key, value);
  };

  const updateArrayContent = async (key: keyof ContentData, index: number, value: string) => {
    let newArr: string[] = [];
    setContent(prev => {
      newArr = [...(prev[key] as string[])];
      newArr[index] = value;
      return { ...prev, [key]: newArr };
    });
    await saveToSupabase(key, newArr);
  };

  const addArrayContent = async (key: keyof ContentData) => {
    let newArr: string[] = [];
    setContent(prev => {
      newArr = [...(prev[key] as string[]), ''];
      return { ...prev, [key]: newArr };
    });
    await saveToSupabase(key, newArr);
  };

  const removeArrayContent = async (key: keyof ContentData, index: number) => {
    let newArr: string[] = [];
    setContent(prev => {
      newArr = [...(prev[key] as string[])];
      newArr.splice(index, 1);
      return { ...prev, [key]: newArr };
    });
    await saveToSupabase(key, newArr);
  };

  const setFirstArrayContent = async (key: keyof ContentData, value: string) => {
    let newArr: string[] = [];
    setContent(prev => {
      newArr = [...(prev[key] as string[])];
      if (newArr.length === 0) newArr.push(value);
      else newArr[0] = value;
      return { ...prev, [key]: newArr };
    });
    await saveToSupabase(key, newArr);
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, updateArrayContent, addArrayContent, removeArrayContent, setFirstArrayContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
