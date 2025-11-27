/**
 * LowStockAlert komponens - Alacsony készlet figyelmeztetések
 * Frontend Developer: Sarah Kim
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const LowStockAlert = ({ onItemClick }) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadLowStockItems();
    
    // Frissítés 30 másodpercenként
    const interval = setInterval(loadLowStockItems, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLowStockItems = async () => {
    try {
      setLoading(true);
      const response = await api.getLowStockItems();
      setLowStockItems(response.data);
    } catch (error) {
      console.error('Low stock items betöltési hiba:', error);
    } finally {
      setLoading(false);
    }
  };

  if (lowStockItems.length === 0) {
    return null; // Ne jelenjen meg, ha nincs low stock
  }

  return (
    <>
      {/* Floating alert button */}
      <button 
        className={`low-stock-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`${lowStockItems.length} tárgy alacsony készletű`}
      >
        <span className="alert-icon">⚠️</span>
        <span className="alert-badge">{lowStockItems.length}</span>
      </button>

      {/* Alert panel */}
      {isOpen && (
        <div className="low-stock-panel">
          <div className="panel-header">
            <h3>⚠️ Alacsony készlet</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="panel-content">
            {loading ? (
              <div className="loading">Betöltés...</div>
            ) : (
              <div className="items-list">
                {lowStockItems.map(item => (
                  <div 
                    key={item.id} 
                    className="low-stock-item"
                    onClick={() => {
                      if (onItemClick) {
                        onItemClick(item);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div className="item-icon">
                      {item.image_filename ? (
                        <img 
                          src={api.getThumbnailUrl(item.image_filename)} 
                          alt={item.name}
                        />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>

                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-category">{item.category}</div>
                      <div className="item-quantity">
                        <span className="current">{item.quantity}</span>
                        <span className="separator">/</span>
                        <span className="minimum">{item.min_quantity}</span>
                        <span className="label">db</span>
                      </div>
                    </div>

                    <div className="item-status">
                      <span className="status-badge critical">
                        Kritikus
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel-footer">
            <button 
              className="btn btn-primary" 
              onClick={loadLowStockItems}
              disabled={loading}
            >
              🔄 Frissítés
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .low-stock-button {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #f39c12, #e67e22);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s;
          animation: pulse 2s infinite;
        }

        .low-stock-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        }

        .low-stock-button.open {
          background: #e74c3c;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          50% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 10px rgba(243, 156, 18, 0.3);
          }
        }

        .alert-icon {
          font-size: 28px;
        }

        .alert-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #e74c3c;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 2px solid white;
        }

        .low-stock-panel {
          position: fixed;
          bottom: 150px;
          right: 20px;
          width: 380px;
          max-height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          z-index: 999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          padding: 15px 20px;
          background: linear-gradient(135deg, #f39c12, #e67e22);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
        }

        .close-btn:hover {
          opacity: 0.8;
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }

        .loading {
          padding: 40px;
          text-align: center;
          color: #666;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .low-stock-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .low-stock-item:hover {
          background: #ffe69c;
          transform: translateX(-5px);
        }

        .item-icon {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .item-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-icon span {
          font-size: 28px;
        }

        .item-info {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-weight: 600;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .item-category {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .item-quantity {
          font-size: 14px;
          font-weight: 600;
        }

        .item-quantity .current {
          color: #e74c3c;
        }

        .item-quantity .separator {
          color: #999;
          margin: 0 4px;
        }

        .item-quantity .minimum {
          color: #2ecc71;
        }

        .item-quantity .label {
          color: #999;
          margin-left: 4px;
          font-weight: normal;
        }

        .item-status {
          flex-shrink: 0;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.critical {
          background: #e74c3c;
          color: white;
        }

        .panel-footer {
          padding: 15px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: center;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2980b9;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .low-stock-panel {
            right: 10px;
            width: calc(100% - 20px);
            max-width: 380px;
          }

          .low-stock-button {
            right: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default LowStockAlert;
