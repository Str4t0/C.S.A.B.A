/**
 * Retro Sketch Design Demo
 * Összes design elem bemutatása
 */

import React, { useState } from 'react';
import '../styles/retro-sketch.css';

const RetroDesignDemo = () => {
  const [progress, setProgress] = useState(65);
  const [toggleOn, setToggleOn] = useState(false);

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      
      {/* Title Section */}
      <div className="paper-card text-center-sketch mb-sketch">
        <h1 className="title-sketch">
          ✏️ Retro Sketch Design System ✏️
        </h1>
        <p className="subtitle-sketch">
          Kézzel rajzolt vintage stílus a home inventory rendszerhez
        </p>
      </div>

      {/* Colors */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">🎨 Színpaletta</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px',
          marginTop: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: 'var(--paper-beige)', 
              height: '80px', 
              border: '3px solid var(--ink-dark)',
              borderRadius: '8px',
              marginBottom: '10px'
            }}></div>
            <div className="badge-sketch">Paper Beige</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: 'var(--orange-sketch)', 
              height: '80px', 
              border: '3px solid var(--ink-dark)',
              borderRadius: '8px',
              marginBottom: '10px'
            }}></div>
            <div className="badge-sketch badge-sketch-orange">Orange</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: 'var(--green-sketch)', 
              height: '80px', 
              border: '3px solid var(--ink-dark)',
              borderRadius: '8px',
              marginBottom: '10px'
            }}></div>
            <div className="badge-sketch badge-sketch-green">Green</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: 'var(--blue-sketch)', 
              height: '80px', 
              border: '3px solid var(--ink-dark)',
              borderRadius: '8px',
              marginBottom: '10px'
            }}></div>
            <div className="badge-sketch badge-sketch-blue">Blue</div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">🔘 Gombok</h2>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          flexWrap: 'wrap',
          marginTop: '20px'
        }}>
          <button className="btn-sketch">Alap gomb</button>
          <button className="btn-sketch btn-sketch-primary">Primary</button>
          <button className="btn-sketch btn-sketch-success">Success</button>
          <button className="btn-sketch btn-sketch-info">Info</button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">📝 Input mezők</h2>
        <div style={{ marginTop: '20px' }}>
          <input 
            type="text" 
            className="input-sketch mb-sketch" 
            placeholder="Írd be a szöveget..."
          />
          <textarea 
            className="input-sketch" 
            placeholder="Többsoros szöveg..."
            rows="4"
          ></textarea>
        </div>
      </div>

      {/* Icons */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">🎯 Ikonok</h2>
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          flexWrap: 'wrap',
          marginTop: '20px'
        }}>
          <div className="icon-sketch float-sketch">📦</div>
          <div className="icon-sketch float-sketch">🔲</div>
          <div className="icon-sketch float-sketch">👤</div>
          <div className="icon-sketch float-sketch">📍</div>
          <div className="icon-sketch float-sketch">⚠️</div>
          <div className="icon-sketch float-sketch">📸</div>
        </div>
      </div>

      {/* Badges */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">🏷️ Címkék (Badges)</h2>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          marginTop: '20px'
        }}>
          <span className="badge-sketch">Default</span>
          <span className="badge-sketch badge-sketch-orange">Figyelem</span>
          <span className="badge-sketch badge-sketch-green">Siker</span>
          <span className="badge-sketch badge-sketch-blue">Info</span>
          <span className="badge-sketch" style={{background: '#e74c3c', color: 'white'}}>
            Kritikus
          </span>
        </div>
      </div>

      {/* Alerts */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">📢 Figyelmeztetések</h2>
        <div style={{ marginTop: '20px' }}>
          <div className="alert-sketch alert-sketch-warning mb-sketch">
            <div className="alert-content">
              <strong>Figyelem!</strong> Ez egy fontos üzenet számodra.
            </div>
          </div>
          <div className="alert-sketch alert-sketch-danger mb-sketch">
            <div className="alert-content">
              <strong>Hiba!</strong> Valami nem sikerült.
            </div>
          </div>
          <div className="alert-sketch alert-sketch-success">
            <div className="alert-content">
              <strong>Siker!</strong> A művelet sikeresen befejeződött.
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">📋 Lista elemek</h2>
        <ul className="list-sketch" style={{ marginTop: '20px' }}>
          <li>Samsung TV 55" - Nappali</li>
          <li>iPhone 13 Pro - Személyes</li>
          <li>IKEA Malm ágy - Háló szoba</li>
          <li>Bosch mosógép - Fürdőszoba</li>
        </ul>
      </div>

      {/* Progress Bar */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">📊 Folyamatjelző</h2>
        <div style={{ marginTop: '20px' }}>
          <div className="progress-sketch mb-sketch">
            <div 
              className="progress-bar-sketch" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-sketch btn-sketch-primary"
              onClick={() => setProgress(Math.max(0, progress - 10))}
            >
              ➖ Csökkent
            </button>
            <button 
              className="btn-sketch btn-sketch-success"
              onClick={() => setProgress(Math.min(100, progress + 10))}
            >
              ➕ Növel
            </button>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">🔄 Kapcsoló (Toggle)</h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          marginTop: '20px'
        }}>
          <label className="toggle-sketch">
            <input 
              type="checkbox" 
              checked={toggleOn}
              onChange={() => setToggleOn(!toggleOn)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="subtitle-sketch">
            {toggleOn ? 'Bekapcsolva ✅' : 'Kikapcsolva ❌'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">📑 Fülek (Tabs)</h2>
        <div className="tabs-sketch" style={{ marginTop: '20px' }}>
          <button className="tab-sketch active">Összes</button>
          <button className="tab-sketch">Elektronika</button>
          <button className="tab-sketch">Bútorok</button>
          <button className="tab-sketch">Egyéb</button>
        </div>
      </div>

      {/* Divider */}
      <hr className="divider-sketch" />

      {/* Typography */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">✍️ Tipográfia</h2>
        <div style={{ marginTop: '20px' }}>
          <h1 className="title-sketch mb-sketch">
            Nagy cím (Title Sketch)
          </h1>
          <p className="subtitle-sketch mb-sketch">
            Alcím (Subtitle Sketch) - kisebb, de még mindig hangsúlyos
          </p>
          <h3 className="heading-sketch mb-sketch">
            Szekció cím (Heading Sketch)
          </h3>
          <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--ink-medium)' }}>
            Normál bekezdés szöveg. Ez a Patrick Hand betűtípus, amit a legtöbb
            szöveges tartalomhoz használunk. Olvasható és barátságos megjelenésű.
          </p>
        </div>
      </div>

      {/* Card Examples */}
      <div className="paper-card mb-sketch">
        <h2 className="heading-sketch">🎴 Kártya példák</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          marginTop: '20px'
        }}>
          <div className="sketch-border p-sketch">
            <div className="icon-sketch" style={{ margin: '0 auto 15px' }}>
              📦
            </div>
            <h4 style={{ fontFamily: 'var(--font-casual)', textAlign: 'center' }}>
              Tárgy 1
            </h4>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '14px', textAlign: 'center' }}>
              Samsung TV 55"
            </p>
          </div>

          <div className="sketch-border sketch-border-orange p-sketch">
            <div className="icon-sketch" style={{ margin: '0 auto 15px' }}>
              ⚠️
            </div>
            <h4 style={{ fontFamily: 'var(--font-casual)', textAlign: 'center' }}>
              Alacsony készlet
            </h4>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '14px', textAlign: 'center' }}>
              2 / 5 db
            </p>
          </div>

          <div className="sketch-border sketch-border-green p-sketch">
            <div className="icon-sketch" style={{ margin: '0 auto 15px' }}>
              ✅
            </div>
            <h4 style={{ fontFamily: 'var(--font-casual)', textAlign: 'center' }}>
              Készleten
            </h4>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '14px', textAlign: 'center' }}>
              15 db
            </p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="paper-card">
        <h2 className="heading-sketch">📚 Használat</h2>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontFamily: 'var(--font-hand)', marginBottom: '10px' }}>
            1. Importáld a CSS-t:
          </h4>
          <div style={{ 
            background: 'var(--ink-dark)', 
            color: '#00ff00',
            padding: '15px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            marginBottom: '15px'
          }}>
            import './styles/retro-sketch.css';
          </div>

          <h4 style={{ fontFamily: 'var(--font-hand)', marginBottom: '10px' }}>
            2. Használd az osztályokat:
          </h4>
          <div style={{ 
            background: 'var(--ink-dark)', 
            color: '#00ff00',
            padding: '15px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {'<div className="paper-card">'}<br/>
            {'  <h2 className="heading-sketch">Címsor</h2>'}<br/>
            {'  <button className="btn-sketch btn-sketch-primary">'}<br/>
            {'    Mentés'}<br/>
            {'  </button>'}<br/>
            {'</div>'}
          </div>
        </div>
      </div>

    </div>
  );
};

export default RetroDesignDemo;
