/**
 * ItemCard komponens - Egyetlen tárgy megjelenítése kártya formában
 * Frontend Developer: Sarah Kim
 */

import React from 'react';
import { imagesAPI } from '../services/api';

const ItemCard = ({ item, onEdit, onDelete, onPreview }) => {
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Elektronika': '💻',
      'Bútorok': '🛋️',
      'Konyhai eszközök': '🍳',
      'Szerszámok': '🔧',
      'Ruházat': '👕',
      'Könyvek': '📚',
      'Műszaki cikkek': '⚙️',
      'Egyéb': '📦'
    };
    return icons[category] || '📦';
  };

  const mainImage = item.images?.[0]?.filename || item.image_filename;
  const orientationClass = item.images?.[0]?.orientation || 'square';

  return (
    <div className="item-card" onClick={() => onPreview?.(item, 0)} style={{ cursor: onPreview ? 'pointer' : 'default' }}>
      <div className={`item-image ${orientationClass}`}>
        {mainImage ? (
          <img
            src={imagesAPI.getThumbnailUrl(mainImage)}
            alt={item.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = getCategoryIcon(item.category);
            }}
          />
        ) : (
          getCategoryIcon(item.category)
        )}
      </div>
      
      <div className="item-content">
        <div className="item-header">
          <div>
            <h3 className="item-title">{item.name}</h3>
            <span className="item-category">
              {getCategoryIcon(item.category)} {item.category}
            </span>
          </div>
        </div>

        {item.description && (
          <p className="item-description">{item.description}</p>
        )}

        <div className="item-footer">
          <div>
            <div className="item-price">{formatPrice(item.purchase_price)}</div>
            {item.purchase_date && (
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {formatDate(item.purchase_date)}
              </small>
            )}
          </div>
          
          <div className="item-actions">
            <button
              className="icon-btn"
              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
              title="Szerkesztés"
            >
              ✏️
            </button>
            {onPreview && (
              <button
                className="icon-btn"
                onClick={(e) => { e.stopPropagation(); onPreview(item, 0); }}
                title="Előnézet"
              >
                👁️
              </button>
            )}
              <button
                className="icon-btn delete"
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                title="Törlés"
              >
                🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
