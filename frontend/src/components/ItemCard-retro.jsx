/**
 * ItemCard - RETRO SKETCH EDITION
 * Frontend Developer: Sarah Kim
 */

import React from 'react';
import api from '../services/api';

const ItemCard = ({ item, onEdit, onDelete }) => {
  const isLowStock = item.min_quantity && item.quantity <= item.min_quantity;

  return (
    <div className={`item-card-sketch paper-card ${isLowStock ? 'low-stock-card' : ''}`}>
      {/* Low Stock Badge */}
      {isLowStock && (
        <div className="low-stock-badge-sketch">
          ⚠️ Alacsony készlet!
        </div>
      )}

      {/* Image */}
      <div className="item-image-sketch">
        {item.image_filename ? (
          <img
            src={api.getThumbnailUrl(item.image_filename)}
            alt={item.name}
            className="sketch-border"
          />
        ) : (
          <div className="no-image-sketch icon-sketch">
            📦
          </div>
        )}
      </div>

      {/* Content */}
      <div className="item-content-sketch">
        {/* Title */}
        <h3 className="item-title-sketch">
          {item.name}
        </h3>

        {/* Category badge */}
        <div className="badge-sketch badge-sketch-blue item-category-badge">
          {item.category}
        </div>

        {/* Meta info */}
        <div className="item-meta-sketch">
          {/* Location */}
          {item.location && (
            <div className="meta-item-sketch">
              <span className="meta-icon-sketch">📍</span>
              <span className="meta-text-sketch">{item.location.name}</span>
            </div>
          )}

          {/* User */}
          {item.user && (
            <div className="meta-item-sketch">
              <span className="meta-icon-sketch">👤</span>
              <span className="meta-text-sketch">{item.user.display_name}</span>
            </div>
          )}

          {/* Quantity */}
          {item.quantity > 1 && (
            <div className="meta-item-sketch">
              <span className="meta-icon-sketch">📦</span>
              <span className="meta-text-sketch">
                {item.quantity} db
                {item.min_quantity && ` / ${item.min_quantity}`}
              </span>
            </div>
          )}

          {/* Price */}
          {item.purchase_price && (
            <div className="meta-item-sketch">
              <span className="meta-icon-sketch">💰</span>
              <span className="meta-text-sketch">
                {item.purchase_price.toLocaleString()} Ft
              </span>
            </div>
          )}

          {/* QR Code */}
          {item.qr_code && (
            <div className="meta-item-sketch">
              <span className="meta-icon-sketch">🔲</span>
              <span className="meta-text-sketch mono-sketch">{item.qr_code}</span>
            </div>
          )}

          {/* Documents */}
          {item.documents && item.documents.length > 0 && (
            <div className="meta-item-sketch">
              <span className="meta-icon-sketch">📎</span>
              <span className="meta-text-sketch">{item.documents.length} dokumentum</span>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="item-description-sketch">
            {item.description.length > 80 
              ? `${item.description.substring(0, 80)}...` 
              : item.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="item-actions-sketch">
        <button
          className="btn-sketch btn-sketch-info btn-small-sketch"
          onClick={() => onEdit(item)}
        >
          ✏️ Szerkeszt
        </button>
        <button
          className="btn-sketch btn-small-sketch"
          onClick={() => onDelete(item.id)}
          style={{
            background: '#e74c3c',
            color: 'white',
            borderColor: '#c0392b'
          }}
        >
          🗑️ Töröl
        </button>
      </div>

      <style jsx>{`
        .item-card-sketch {
          display: flex;
          flex-direction: column;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .item-card-sketch:hover {
          transform: rotate(-1deg) translateY(-5px);
          box-shadow: 6px 6px 0px rgba(0,0,0,0.2);
        }

        .low-stock-card {
          border-color: var(--orange-sketch);
          background: #FFF3CD;
        }

        .low-stock-badge-sketch {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--orange-sketch);
          color: white;
          padding: 4px 10px;
          border: 2px solid var(--red-sketch);
          border-radius: 20px;
          font-family: var(--font-hand);
          font-size: 12px;
          font-weight: 600;
          box-shadow: 2px 2px 0px rgba(0,0,0,0.2);
          z-index: 10;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .item-image-sketch {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          overflow: hidden;
        }

        .item-image-sketch img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image-sketch {
          width: 120px;
          height: 120px;
          font-size: 64px;
        }

        .item-content-sketch {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .item-title-sketch {
          font-family: var(--font-casual);
          font-size: 24px;
          font-weight: 700;
          color: var(--ink-dark);
          margin: 0;
          line-height: 1.2;
        }

        .item-category-badge {
          align-self: flex-start;
        }

        .item-meta-sketch {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meta-item-sketch {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-hand);
          font-size: 14px;
          color: var(--ink-medium);
        }

        .meta-icon-sketch {
          font-size: 16px;
        }

        .meta-text-sketch {
          line-height: 1;
        }

        .mono-sketch {
          font-family: monospace;
          background: var(--paper-beige);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .item-description-sketch {
          font-family: var(--font-hand);
          font-size: 14px;
          color: var(--ink-medium);
          line-height: 1.4;
          margin: 0;
          padding: 10px;
          background: white;
          border: 2px solid var(--ink-dark);
          border-radius: 6px;
        }

        .item-actions-sketch {
          display: flex;
          gap: 8px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px dashed var(--ink-dark);
        }

        .btn-small-sketch {
          flex: 1;
          padding: 8px 16px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ItemCard;
