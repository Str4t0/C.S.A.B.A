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
        <div className="setting-card disabled-card">
          <div className="setting-icon">ℹ️</div>
          <div className="setting-content">
            <h3>Jelenleg nincs elérhető beállítás</h3>
            <p>A menüpontok közül eltávolítottuk az Értesítések, Statisztika és QR olvasó elemeket.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
