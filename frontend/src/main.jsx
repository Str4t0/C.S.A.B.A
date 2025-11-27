/**
 * Main entry point
 * Frontend Developer: Sarah Kim
 * Multiple Design Support: Claude AI
 */
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'                         // Eredeti app
import AppGameUI from './App-game-ui.jsx'           // Game UI app
import './styles/main.css'
import './styles/retro-sketch.css'                  // Retro CSS
import './styles/inventory-game-ui.css'             // Game UI CSS

function AppSwitcher() {
  const [useGameUI, setUseGameUI] = useState(true);  // true = Game UI, false = Retro
  
  return (
    <>
      {/* Design váltó gomb */}
      <button
        onClick={() => setUseGameUI(!useGameUI)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '10px 20px',
          background: useGameUI ? '#F4A460' : '#E67E22',
          border: '3px solid #3A2817',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {useGameUI ? '🎮 Game UI' : '📝 Retro Design'}
      </button>
      
      {/* Kiválasztott app */}
      {useGameUI ? <AppGameUI /> : <App />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppSwitcher />
  </React.StrictMode>,
)