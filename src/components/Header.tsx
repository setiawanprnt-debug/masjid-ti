import React, { useState, useEffect } from 'react';
import logoSrc from '../assets/Logo_TI.png';
import './Header.css';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const Header: React.FC = () => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Banyuwangi&country=Indonesia&method=20');
        const data = await response.json();
        if (data && data.data && data.data.timings) {
          setTimes(data.data.timings);
          
          // Format Gregorian date (e.g., Selasa, 6 Agustus 2024)
          const dateObj = new Date();
          const formattedDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          
          // Get Hijri date from API
          let hijriStr = '';
          if (data.data.date && data.data.date.hijri) {
            const h = data.data.date.hijri;
            hijriStr = ` / ${h.day} ${h.month.en} ${h.year} H`;
          }
          
          setDateStr(formattedDate + hijriStr);
        }
      } catch (error) {
        console.error("Gagal mengambil jadwal sholat", error);
      }
    };

    fetchPrayerTimes();
  }, []);

  return (
    <header className="header-wrapper">
      <div className="header-top">
        <div className="running-text">
          Masjid Tunas Ilmu | Dusun Krajan RT.03/RW.01 Desa Buluagung, Kecamatan Siliragung, Kabupaten Banyuwangi, Telepon: 0813 3209 6116
        </div>
      </div>
      <div className="header-main container">
        <div className="logo-container">
          <img src={logoSrc} alt="Logo Masjid Tunas Ilmu" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
          <h2>MASJID TUNAS ILMU<br/>BANYUWANGI</h2>
        </div>
        <div className="prayer-times">
          <div className="prayer-header">
            <strong>Waktu sholat di Banyuwangi (Kemenag)</strong>
            <span>{dateStr || 'Memuat...'}</span>
          </div>
          <div className="prayer-blocks">
            <div className="prayer-block"><span>SUBUH</span><strong>{times?.Fajr || '--:--'}</strong></div>
            <div className="prayer-block"><span>TERBIT</span><strong>{times?.Sunrise || '--:--'}</strong></div>
            <div className="prayer-block"><span>DZUHUR</span><strong>{times?.Dhuhr || '--:--'}</strong></div>
            <div className="prayer-block"><span>ASHAR</span><strong>{times?.Asr || '--:--'}</strong></div>
            <div className="prayer-block"><span>MAGHRIB</span><strong>{times?.Maghrib || '--:--'}</strong></div>
            <div className="prayer-block"><span>ISYA</span><strong>{times?.Isha || '--:--'}</strong></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
