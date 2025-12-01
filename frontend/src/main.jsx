/**
 * Main entry point
 * Frontend Developer: Sarah Kim
 * Multiple Design Support: Claude AI
 */
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'                         // Eredeti app
import AppGameUI from './App-game-ui.jsx'           // Game UI app
import { UIProvider } from './contexts/UIContext'   // UI Context
import './styles/main.css'
import './styles/retro-sketch.css'                  // Retro CSS
import './styles/inventory-game-ui.css'             // Game UI CSS

function AppSwitcher() {
  const [useGameUI, setUseGameUI] = useState(true);  // true = Game UI, false = Retro
  
  return (
    <UIProvider value={{ isGameUI: useGameUI, setIsGameUI: setUseGameUI }}>
      <div style={{ position: 'relative' }}>
        {/* Design váltó gomb - a tartalom tetején, eltűnik görgetéskor */}
        <button
          onClick={() => setUseGameUI(!useGameUI)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1001,
            padding: '8px 16px',
            background: useGameUI ? '#F4A460' : '#E67E22',
            border: '3px solid #3A2817',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          {useGameUI ? '🎮 Game UI' : '📝 Retro Design'}
        </button>
        
        {/* Kiválasztott app */}
        {useGameUI ? <AppGameUI /> : <App />}
      </div>
    </UIProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppSwitcher />
      <Toaster position="top-right" />
    </BrowserRouter>
  </React.StrictMode>,
)