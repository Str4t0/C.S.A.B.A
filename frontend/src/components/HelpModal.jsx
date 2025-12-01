/**
 * HelpModal - Használati útmutató modal (Game UI design)
 */
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/inventory-game-ui.css';

const HelpModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('start');

  if (!isOpen) return null;

  const sections = [
    { id: 'start', icon: '🚀', title: 'Első lépések' },
    { id: 'items', icon: '📦', title: 'Tárgyak' },
    { id: 'search', icon: '🔍', title: 'Keresés' },
    { id: 'camera', icon: '📷', title: 'Képek' },
    { id: 'qr', icon: '📱', title: 'QR kód' },
    { id: 'alerts', icon: '🔔', title: 'Értesítések' },
    { id: 'stats', icon: '📊', title: 'Statisztikák' },
    { id: 'settings', icon: '⚙️', title: 'Beállítások' },
    { id: 'tips', icon: '💡', title: 'Tippek' },
  ];

  const content = {
    start: (
      <>
        <h4>🚀 Első lépések</h4>
        <div className="help-section">
          <p><strong>Alkalmazás indítása:</strong></p>
          <p>Windows: dupla kattintás a <code>START-ALL.bat</code> fájlra</p>
          <p>Böngészőben: <strong>http://localhost:3000</strong></p>
          
          <p style={{marginTop: '15px'}}><strong>Hálózati elérés (mobil/tablet):</strong></p>
          <p><strong>https://89.134.157.175:3000/</strong></p>
          
          <p style={{marginTop: '15px'}}><strong>Kamera használathoz:</strong></p>
          <p>Indítsd: <code>START-ALL-HTTPS.bat</code></p>
        </div>
      </>
    ),
    items: (
      <>
        <h4>📦 Tárgyak kezelése</h4>
        <div className="help-section">
          <p><strong>Új tárgy:</strong></p>
          <ol>
            <li>➕ Új tárgy gomb</li>
            <li>Név + Kategória kitöltése</li>
            <li>Kép, dokumentum hozzáadása</li>
            <li>Mentés</li>
          </ol>
          
          <p style={{marginTop: '15px'}}><strong>Szerkesztés:</strong></p>
          <p>Tárgyra kattintás → Előnézet → ✏️ Szerkesztés</p>
          
          <p style={{marginTop: '15px'}}><strong>Törlés:</strong></p>
          <p>Szerkesztés → 🗑️ Törlés gomb</p>
        </div>
      </>
    ),
    search: (
      <>
        <h4>🔍 Keresés és szűrés</h4>
        <div className="help-section">
          <p><strong>Keresés:</strong> Írd be a nevet a keresőmezőbe</p>
          <p>Keres a névben, leírásban, megjegyzésben</p>
          
          <p style={{marginTop: '15px'}}><strong>Kategória szűrés:</strong></p>
          <p>Kattints egy kategória gombra (pl. Elektronika)</p>
          
          <p style={{marginTop: '15px'}}><strong>Együtt működik!</strong></p>
          <p>Keresés + kategória = szűkített találatok</p>
          
          <p style={{marginTop: '15px'}}><strong>Szűrők törlése:</strong></p>
          <p>🔄 Frissítés vagy Összes gomb</p>
        </div>
      </>
    ),
    camera: (
      <>
        <h4>📷 Képek kezelése</h4>
        <div className="help-section">
          <p><strong>Kép feltöltése:</strong></p>
          <p>Szerkesztés → 📁 Fájl kiválasztása</p>
          
          <p style={{marginTop: '15px'}}><strong>Fotó készítése (mobil):</strong></p>
          <ol>
            <li>📷 Fotó készítése gomb</li>
            <li>Kamera engedélyezése</li>
            <li>Fotó elkészítése</li>
          </ol>
          
          <div style={{
            background: 'rgba(255,193,7,0.2)',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '10px',
            marginTop: '15px'
          }}>
            ⚠️ Kamera csak <strong>HTTPS</strong>-en működik!
          </div>
        </div>
      </>
    ),
    qr: (
      <>
        <h4>📱 QR kód használata</h4>
        <div className="help-section">
          <p><strong>QR kód generálása:</strong></p>
          <ol>
            <li>Tárgy szerkesztése</li>
            <li>🔲 QR kód generálása gomb</li>
          </ol>
          
          <p style={{marginTop: '15px'}}><strong>QR kód beolvasása:</strong></p>
          <ol>
            <li>📷 QR Scanner menü</li>
            <li>Kamera indítása</li>
            <li>Telefon a QR kód fölé</li>
            <li>Tárgy automatikusan megnyílik</li>
          </ol>
        </div>
      </>
    ),
    alerts: (
      <>
        <h4>🔔 Értesítések</h4>
        <div className="help-section">
          <p><strong>Értesítés típusok:</strong></p>
          <ul>
            <li>⚠️ Alacsony készlet</li>
            <li>📸 Hiányzó képek</li>
            <li>📍 Helyszín nélküli</li>
            <li>👤 Tulajdonos nélküli</li>
            <li>📱 QR kód nélküli</li>
          </ul>
          <p style={{marginTop: '10px'}}>Kattints → érintett tárgyak listája!</p>
        </div>
      </>
    ),
    stats: (
      <>
        <h4>📊 Statisztikák</h4>
        <div className="help-section">
          <p><strong>Áttekintés:</strong></p>
          <ul>
            <li>📦 Összes tárgy száma</li>
            <li>💰 Összes érték</li>
            <li>📈 Adatok teljessége (%)</li>
            <li>🏆 Top 5 legértékesebb</li>
          </ul>
          <p style={{marginTop: '10px'}}>Kattints egy tárgyra → előnézet!</p>
        </div>
      </>
    ),
    settings: (
      <>
        <h4>⚙️ Beállítások</h4>
        <div className="help-section">
          <p><strong>Felhasználók kezelése:</strong></p>
          <p>Beállítások → Felhasználók → Hozzáadás/Törlés</p>
          
          <p style={{marginTop: '15px'}}><strong>Helyszínek kezelése:</strong></p>
          <p>Beállítások → Helyszínek → Hozzáadás/Törlés</p>
        </div>
      </>
    ),
    tips: (
      <>
        <h4>💡 Tippek és GYIK</h4>
        <div className="help-section">
          <p><strong>Hasznos tippek:</strong></p>
          <ul>
            <li>📱 Teljesen reszponzív - mobilon is!</li>
            <li>🔌 Offline működik - internet nem kell</li>
            <li>🎨 Dizájn váltás: jobb felső sarok</li>
          </ul>
          
          <p style={{marginTop: '15px'}}><strong>Biztonsági mentés:</strong></p>
          <p>Másold el:</p>
          <ul>
            <li><code>backend/home_inventory.db</code></li>
            <li><code>backend/uploads/</code></li>
          </ul>
        </div>
      </>
    ),
  };

  const modalContent = (
    <div className="game-modal-overlay" onClick={onClose}>
      <div 
        className="game-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '700px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="game-modal-header" style={{ flexShrink: 0 }}>
          <span>❓ Használati útmutató</span>
          <div className="game-modal-close" onClick={onClose}>✕</div>
        </div>

        {/* Content */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1, 
          minHeight: 0, 
          overflow: 'hidden' 
        }}>
          {/* Top menu - vízszintes ikonok */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            padding: '10px 15px',
            background: 'var(--game-cream)',
            borderBottom: '2px solid var(--game-brown)',
            justifyContent: 'center'
          }}>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                title={section.title}
                style={{
                  padding: '8px 12px',
                  border: '2px solid var(--game-brown)',
                  borderRadius: '8px',
                  background: activeSection === section.id 
                    ? 'var(--game-orange)'
                    : 'var(--game-cream-light)',
                  color: activeSection === section.id 
                    ? 'white' 
                    : 'var(--game-brown)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '45px',
                  transition: 'all 0.2s'
                }}
              >
                {section.icon}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            color: 'var(--game-brown)',
            fontFamily: 'var(--font-text)',
            lineHeight: '1.6'
          }}>
            {content[activeSection]}
          </div>
        </div>
      </div>

      <style>{`
        .help-section {
          font-size: 14px;
        }
        .help-section p {
          margin: 5px 0;
        }
        .help-section ul, .help-section ol {
          margin: 8px 0;
          padding-left: 20px;
        }
        .help-section li {
          margin: 4px 0;
        }
        .help-section code {
          background: var(--game-cream);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          border: 1px solid var(--game-brown-light);
        }
        .help-section h4 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: var(--game-brown);
          font-family: var(--font-game);
          border-bottom: 2px solid var(--game-brown);
          padding-bottom: 8px;
        }
        
        @media (max-width: 400px) {
          .help-section {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Kérdőjel gomb komponens
export const HelpButton = () => {
  return null; // A gomb inline-ban van definiálva
};

export default HelpModal;
