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

      <p className="settings-empty">Jelenleg nincs konfigurálható beállítás ezen a nézeten.</p>
    </div>
  );
};

export default Settings;
