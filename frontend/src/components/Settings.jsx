import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>⚙️ Beállítások</h1>
          <p>Alkalmazás funkciók és navigáció</p>
        </div>
        <Link to="/" className="settings-home-link">← Vissza a főoldalra</Link>
      </div>

      <div className="settings-grid">
        {/* Értesítések - MŰKÖDŐ */}
        <div className="setting-card" onClick={() => navigate('/alerts')}>
          <div className="setting-icon alert-icon">🔔</div>
          <div className="setting-content">
            <h3>Értesítések</h3>
            <p>Alacsony készlet értesítések beállítása</p>
          </div>
          <button className="setting-action">Kezelés</button>
        </div>

        {/* Statisztikák - MŰKÖDŐ */}
        <div className="setting-card" onClick={() => navigate('/statistics')}>
          <div className="setting-icon stats-icon">📊</div>
          <div className="setting-content">
            <h3>Statisztikák</h3>
            <p>Részletes statisztikák és riportok</p>
          </div>
          <button className="setting-action">Megtekintés</button>
        </div>

        {/* QR Beolvasó - navigáció */}
        <div className="setting-card" onClick={() => navigate('/qr-scanner')}>
          <div className="setting-icon qr-icon">📷</div>
          <div className="setting-content">
            <h3>QR Beolvasó</h3>
            <p>QR kódok beolvasása és megtekintése</p>
          </div>
          <button className="setting-action">Megnyitás</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
