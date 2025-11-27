import React, { useState } from 'react';
import '../styles/inventory-game-ui.css';

function GameUIDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Összes');

  return (
    <div className="game-ui-container">
      {/* ========== HEADER DEMO ========== */}
      <div className="game-header">
        <div>
          <h1 className="game-title">
            <span className="game-title-icon">🎮</span>
            GAME UI DEMO
          </h1>
          <p className="game-subtitle">| || Design System Showcase</p>
        </div>
      </div>

      {/* ========== STATS DEMO ========== */}
      <div className="game-stats-row">
        <div className="game-stat-badge">
          <div className="game-stat-icon">📦</div>
          <div className="game-stat-content">
            <h3>156</h3>
            <p>Összes tárgy</p>
          </div>
        </div>

        <div className="game-stat-badge">
          <div className="game-stat-icon">💰</div>
          <div className="game-stat-content">
            <h3>2.450.000 Ft</h3>
            <p>Összes érték</p>
          </div>
        </div>

        <div className="game-stat-badge">
          <div className="game-stat-icon">⚠️</div>
          <div className="game-stat-content">
            <h3>12</h3>
            <p>Alacsony készlet</p>
          </div>
        </div>
      </div>

      {/* ========== LAYOUT DEMO ========== */}
      <div className="game-layout">
        {/* Sidebar */}
        <div className="game-sidebar">
          <div className="game-sidebar-title">Menu</div>
          <ul className="game-sidebar-menu">
            <li className="game-sidebar-item active">📦 Items</li>
            <li className="game-sidebar-item">⚠️ Alerts</li>
            <li className="game-sidebar-item">⚙️ Settings</li>
            <li className="game-sidebar-item">📊 Stats</li>
            <li className="game-sidebar-item">👤 Users</li>
          </ul>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '80px', marginBottom: '10px' }}>📦</div>
            <div style={{ fontSize: '40px', color: 'var(--game-green-dark)' }}>⬆️</div>
          </div>
        </div>

        {/* Content */}
        <div className="game-content">
          {/* ========== CÍMEK ========== */}
          <h2 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '32px',
            color: 'var(--game-brown)',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: 'var(--border-medium) solid var(--game-brown)'
          }}>
            🎨 Design Elemek
          </h2>

          {/* ========== SEARCH SECTION ========== */}
          <div className="game-search-section">
            <input
              type="text"
              className="game-search-input"
              placeholder="🔍 Keresés a tárgyak között..."
            />
          </div>

          {/* ========== TABS DEMO ========== */}
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '24px',
            color: 'var(--game-brown)',
            marginTop: '30px',
            marginBottom: '15px'
          }}>
            📑 Tab-ok / Gombok
          </h3>

          <div className="game-tabs">
            {['Összes', 'Raktáron', 'Kevés', 'Archivált'].map(tab => (
              <button
                key={tab}
                className={`game-tab ${selectedTab === tab ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ========== GOMBOK DEMO ========== */}
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '24px',
            color: 'var(--game-brown)',
            marginTop: '30px',
            marginBottom: '15px'
          }}>
            🔘 Gombok
          </h3>

          <div className="game-flex game-gap-10" style={{ flexWrap: 'wrap', marginBottom: '15px' }}>
            <button className="game-btn">🎮 Alap Gomb</button>
            <button className="game-btn game-btn-primary">⚡ Elsődleges</button>
            <button className="game-btn game-btn-success">✅ Siker</button>
            <button className="game-btn game-btn-danger">❌ Veszély</button>
          </div>

          <div className="game-flex game-gap-10" style={{ flexWrap: 'wrap', marginBottom: '15px' }}>
            <button className="game-btn game-btn-small">🔹 Kicsi</button>
            <button className="game-btn">🔹 Normál</button>
            <button className="game-btn game-btn-large">🔹 Nagy</button>
          </div>

          {/* ========== STATUS BADGES ========== */}
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '24px',
            color: 'var(--game-brown)',
            marginTop: '30px',
            marginBottom: '15px'
          }}>
            🏷️ Status Badge-ek
          </h3>

          <div className="game-flex game-gap-10" style={{ flexWrap: 'wrap' }}>
            <span className="game-status-badge">OK</span>
            <span className="game-status-badge low">LOW</span>
            <span className="game-status-badge out">OUT</span>
            <span className="game-status-badge warning">WARNING</span>
          </div>

          {/* ========== ALERTS DEMO ========== */}
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '24px',
            color: 'var(--game-brown)',
            marginTop: '30px',
            marginBottom: '15px'
          }}>
            ⚠️ Alert Panel-ek
          </h3>

          <div className="game-alert">
            <div className="game-alert-header">
              ℹ️ Információ
            </div>
            <div className="game-alert-content">
              Ez egy alap információs panel. Használható általános üzenetek megjelenítésére.
            </div>
          </div>

          <div className="game-alert game-alert-warning">
            <div className="game-alert-header">
              ⚠️ Figyelmeztetés
            </div>
            <div className="game-alert-content">
              <p><strong>Warning:</strong> The stock of certain items is running low.</p>
              <p>Kérjük, ellenőrizd a készletet!</p>
            </div>
          </div>

          <div className="game-alert game-alert-danger">
            <div className="game-alert-header">
              🚨 Veszély
            </div>
            <div className="game-alert-content">
              Kritikus hiba történt! Azonnali beavatkozás szükséges.
            </div>
          </div>

          {/* ========== ITEM CARDS DEMO ========== */}
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '24px',
            color: 'var(--game-brown)',
            marginTop: '30px',
            marginBottom: '15px'
          }}>
            🎴 Tárgy Kártyák
          </h3>

          <div className="game-items-grid">
            {/* OK Status Card */}
            <div className="game-item-card">
              <span className="game-status-badge">OK</span>
              <div className="game-item-header">
                <div className="game-item-icon">⚔️</div>
                <h2 className="game-item-title">Laser Sword</h2>
              </div>
              <div className="game-item-meta">
                <div className="game-item-meta-row">
                  <span className="game-item-meta-label">📊 Mennyiség:</span>
                  <span className="game-item-meta-value">12</span>
                </div>
                <div className="game-item-meta-row">
                  <span className="game-item-meta-label">📍 Hely:</span>
                  <span className="game-item-meta-value">A-01</span>
                </div>
                <div className="game-item-meta-row">
                  <span className="game-item-meta-label">💰 Ár:</span>
                  <span className="game-item-meta-value">45.000 Ft</span>
                </div>
              </div>
              <div className="game-item-description">
                Egy erős lézer kard, amely áthasít mindent. Használható védekezésre és támadásra is.
              </div>
              <div className="game-item-actions">
                <button className="game-btn game-btn-small">✏️ Szerkeszt</button>
                <button className="game-btn game-btn-small game-btn-success">👁️ Részletek</button>
              </div>
            </div>

            {/* LOW Status Card */}
            <div className="game-item-card low-stock">
              <span className="game-status-badge low">LOW</span>
              <div className="game-item-header">
                <div className="game-item-icon">🔧</div>
                <h2 className="game-item-title">Titanium Wrench Set</h2>
              </div>
              <div className="game-item-meta">
                <div className="game-item-meta-row">
                  <span className="game-item-meta-label">📊 Mennyiség:</span>
                  <span className="game-item-meta-value">4</span>
                </div>
                <div className="game-item-meta-row">
                  <span className="game-item-meta-label">📉 Min:</span>
                  <span className="game-item-meta-value">5</span>
                </div>
                <div className="game-item-meta-row">
                  <span className="game-item-meta-label">📍 Hely:</span>
                  <span className="game-item-meta-value">C-03</span>
                </div>
              </div>
              <div className="game-item-description">
                Professzionális titánium csavarkulcs készlet. Alacsony készlet!
              </div>
              <div className="game-item-actions">
                <button className="game-btn game-btn-small game-btn-primary">➕ Feltölt</button>
                <button className="game-btn game-btn-small game-btn-danger">🗑️ Töröl</button>
              </div>
            </div>

            {/* OUT Status Card */}
            <div className="game-item-card low-stock">
              <span className="game-status-badge out">OUT</span>
              <div className="game-item-header">
                <div className="game-item-icon">⚡</div>
                <h2 className="game-item-title">Thermal Coupling</h2>
              </div>
              <div className="game-item-meta">
                <div className="game-item-meta-row">
                  <span className="game-item-meta-label">📊 Mennyiség:</span>
                  <span className="game-item-meta-value">0</span>
                </div>
                <div className="game-item-meta-row">
                  <span className="game-item-meta-label">📍 Hely:</span>
                  <span className="game-item-meta-value">B-07</span>
                </div>
              </div>
              <div className="game-item-description">
                Termikus csatlakozó. Készlet elfogyott!
              </div>
              <div className="game-item-actions">
                <button className="game-btn game-btn-small game-btn-primary">🛒 Rendelés</button>
                <button className="game-btn game-btn-small">📋 Archivál</button>
              </div>
            </div>
          </div>

          {/* ========== LIST VIEW DEMO ========== */}
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '24px',
            color: 'var(--game-brown)',
            marginTop: '30px',
            marginBottom: '15px'
          }}>
            📋 Lista Nézet
          </h3>

          <div className="game-items-list">
            <div className="game-item-list-row">
              <div className="game-item-list-left">
                <div className="game-item-list-icon">📦</div>
                <div className="game-item-list-info">
                  <h3>Plasma Cell MK2</h3>
                  <p>Mennyiség: 12 • Hely: A-01</p>
                </div>
              </div>
              <div className="game-item-list-right">
                <span className="game-status-badge">OK</span>
                <button className="game-btn game-btn-small">👁️ Részletek</button>
              </div>
            </div>

            <div className="game-item-list-row">
              <div className="game-item-list-left">
                <div className="game-item-list-icon">🔧</div>
                <div className="game-item-list-info">
                  <h3>Titanium Wrench Set</h3>
                  <p>Mennyiség: 4 • Hely: C-03</p>
                </div>
              </div>
              <div className="game-item-list-right">
                <span className="game-status-badge low">LOW</span>
                <button className="game-btn game-btn-small game-btn-primary">➕ Feltölt</button>
              </div>
            </div>
          </div>

          {/* ========== MODAL DEMO ========== */}
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '24px',
            color: 'var(--game-brown)',
            marginTop: '30px',
            marginBottom: '15px'
          }}>
            🪟 Modal Ablak
          </h3>

          <button
            className="game-btn game-btn-primary"
            onClick={() => setModalOpen(true)}
          >
            🪟 Modal Megnyitása
          </button>

          {/* ========== FOOTER ========== */}
          <div className="game-footer-actions">
            <button className="game-btn game-btn-primary">➕ Új tárgy</button>
            <button className="game-btn game-btn-success">📥 Export</button>
            <button className="game-btn">↩️ Vissza</button>
          </div>

          {/* ========== HASZNÁLATI ÚTMUTATÓ ========== */}
          <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: 'var(--border-thick) solid var(--game-brown)' }}>
            <h2 style={{
              fontFamily: 'var(--font-game)',
              fontSize: '32px',
              color: 'var(--game-brown)',
              marginBottom: '20px'
            }}>
              📖 Használati Útmutató
            </h2>

            <div className="game-alert">
              <div className="game-alert-header">
                🎨 CSS Import
              </div>
              <div className="game-alert-content">
                <pre style={{
                  background: 'var(--game-cream-dark)',
                  padding: '15px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
{`// main.jsx vagy App.jsx
import './styles/inventory-game-ui.css';`}
                </pre>
              </div>
            </div>

            <div className="game-alert">
              <div className="game-alert-header">
                🔧 Komponens Használat
              </div>
              <div className="game-alert-content">
                <pre style={{
                  background: 'var(--game-cream-dark)',
                  padding: '15px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
{`// App.jsx helyett App-game-ui.jsx használata
import AppGameUI from './App-game-ui';

function App() {
  return <AppGameUI />;
}`}
                </pre>
              </div>
            </div>

            <div className="game-alert game-alert-warning">
              <div className="game-alert-header">
                ⚙️ Komponensek Listája
              </div>
              <div className="game-alert-content">
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                  <li><strong>App-game-ui.jsx</strong> - Főalkalmazás game UI-val</li>
                  <li><strong>ItemCard-game-ui.jsx</strong> - Tárgy kártya game UI-val</li>
                  <li><strong>GameUIDemo.jsx</strong> - Minden elem demója</li>
                  <li><strong>inventory-game-ui.css</strong> - Teljes design system</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MODAL ========== */}
      {modalOpen && (
        <div className="game-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="game-modal" onClick={(e) => e.stopPropagation()}>
            <div className="game-modal-header">
              <span>🪟 Példa Modal</span>
              <div className="game-modal-close" onClick={() => setModalOpen(false)}>
                ✕
              </div>
            </div>
            <div style={{ padding: '20px 0' }}>
              <p style={{
                fontFamily: 'var(--font-text)',
                fontSize: '16px',
                color: 'var(--game-brown-medium)',
                marginBottom: '20px'
              }}>
                Ez egy példa modal ablak a game UI design-nal. Használható bármilyen tartalom megjelenítésére.
              </p>
              <div className="game-flex game-gap-10">
                <button className="game-btn game-btn-primary" onClick={() => setModalOpen(false)}>
                  ✅ OK
                </button>
                <button className="game-btn" onClick={() => setModalOpen(false)}>
                  ❌ Mégse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameUIDemo;
