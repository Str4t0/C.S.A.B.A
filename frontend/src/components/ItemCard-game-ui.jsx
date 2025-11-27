import React from 'react';
import '../styles/inventory-game-ui.css';

function ItemCardGameUI({ item, status, onDelete, onEdit }) {
  // Status megjelenítés
  const getStatusBadge = () => {
    switch (status) {
      case 'ok':
        return <span className="game-status-badge">OK</span>;
      case 'low':
        return <span className="game-status-badge low">LOW</span>;
      case 'out':
        return <span className="game-status-badge out">OUT</span>;
      default:
        return <span className="game-status-badge">OK</span>;
    }
  };

  // Emoji ikon kategória szerint
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Elektronika': '⚡',
      'Bútorok': '🛋️',
      'Konyhai eszközök': '🍳',
      'Szerszámok': '🔧',
      'Műszaki cikkek': '📱',
      'Ruházat': '👕',
      'Könyvek': '📚',
      'Egyéb': '📦'
    };
    return iconMap[category] || '📦';
  };

  // Kép URL
  const imageUrl = item.image_filename 
    ? `http://localhost:8000/uploads/${item.image_filename}`
    : null;

  // Leírás rövidítés
  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`game-item-card ${status === 'low' || status === 'out' ? 'low-stock' : ''}`}>
      {/* Status Badge */}
      {getStatusBadge()}

      {/* Item Header - Ikon + Cím */}
      <div className="game-item-header">
        <div className="game-item-icon">
          {getCategoryIcon(item.category)}
        </div>
        <h2 className="game-item-title">
          {item.name}
        </h2>
      </div>

      {/* Item Image (ha van) */}
      {imageUrl && (
        <div style={{
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          <img
            src={imageUrl}
            alt={item.name}
            style={{
              maxWidth: '100%',
              height: '150px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-medium)',
              border: 'var(--border-medium) solid var(--game-brown)'
            }}
          />
        </div>
      )}

      {/* Item Meta - Mennyiség, Hely, Ár */}
      <div className="game-item-meta">
        {item.quantity !== undefined && (
          <div className="game-item-meta-row">
            <span className="game-item-meta-label">📊 Mennyiség:</span>
            <span className="game-item-meta-value">{item.quantity}</span>
          </div>
        )}

        {item.min_quantity !== undefined && (
          <div className="game-item-meta-row">
            <span className="game-item-meta-label">📉 Min:</span>
            <span className="game-item-meta-value">{item.min_quantity}</span>
          </div>
        )}

        {item.location_id && (
          <div className="game-item-meta-row">
            <span className="game-item-meta-label">📍 Hely:</span>
            <span className="game-item-meta-value">
              {item.location?.full_path || item.location?.name || `ID: ${item.location_id}`}
            </span>
          </div>
        )}

        {item.purchase_price && (
          <div className="game-item-meta-row">
            <span className="game-item-meta-label">💰 Ár:</span>
            <span className="game-item-meta-value">
              {item.purchase_price.toLocaleString()} Ft
            </span>
          </div>
        )}

        {item.category && (
          <div className="game-item-meta-row">
            <span className="game-item-meta-label">🏷️ Kategória:</span>
            <span className="game-item-meta-value">{item.category}</span>
          </div>
        )}

        {item.user_id && (
          <div className="game-item-meta-row">
            <span className="game-item-meta-label">👤 Felhasználó:</span>
            <span className="game-item-meta-value">
              {item.user?.username || `ID: ${item.user_id}`}
            </span>
          </div>
        )}

        {item.qr_code && (
          <div className="game-item-meta-row">
            <span className="game-item-meta-label">🔲 QR:</span>
            <span className="game-item-meta-value" style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              background: 'var(--game-cream)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {item.qr_code}
            </span>
          </div>
        )}
      </div>

      {/* Item Description */}
      {item.description && (
        <div className="game-item-description">
          {truncateDescription(item.description)}
        </div>
      )}

      {/* Item Actions - Gombok */}
      <div className="game-item-actions">
        {onEdit && (
          <button
            className="game-btn game-btn-small"
            onClick={() => onEdit(item)}
          >
            ✏️ Szerkeszt
          </button>
        )}
        <button
          className="game-btn game-btn-small game-btn-success"
        >
          👁️ Részletek
        </button>
        {onDelete && (
          <button
            className="game-btn game-btn-small game-btn-danger"
            onClick={() => onDelete(item.id)}
          >
            🗑️ Töröl
          </button>
        )}
      </div>
    </div>
  );
}

export default ItemCardGameUI;
