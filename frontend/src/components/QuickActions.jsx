/**
 * QuickActions komponens - Gyors műveletek floating gomb
 * Frontend Developer: Sarah Kim
 */

import React, { useState } from 'react';
import QRScanner from './QRScanner';

const QuickActions = ({ onScanResult, onNewItem }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleScan = async (qrCode) => {
    console.log('QR beolvasva:', qrCode);
    setShowScanner(false);
    
    if (onScanResult) {
      onScanResult(qrCode);
    }
  };

  return (
    <>
      {/* Main floating button */}
      <button 
        className={`quick-actions-button ${showMenu ? 'active' : ''}`}
        onClick={() => setShowMenu(!showMenu)}
        title="Gyors műveletek"
      >
        <span className="icon">{showMenu ? '✖' : '➕'}</span>
      </button>

      {/* Action menu */}
      {showMenu && (
        <div className="quick-actions-menu">
          <button 
            className="action-item qr-scan"
            onClick={() => {
              setShowScanner(true);
              setShowMenu(false);
            }}
          >
            <span className="action-icon">📷</span>
            <span className="action-label">QR Szkennelés</span>
          </button>

          <button 
            className="action-item new-item"
            onClick={() => {
              if (onNewItem) {
                onNewItem();
              }
              setShowMenu(false);
            }}
          >
            <span className="action-icon">📦</span>
            <span className="action-label">Új Tárgy</span>
          </button>
        </div>
      )}

      {/* QR Scanner modal */}
      {showScanner && (
        <QRScanner 
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <style jsx>{`
        .quick-actions-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3498db, #2980b9);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .quick-actions-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        }

        .quick-actions-button.active {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          transform: rotate(45deg);
        }

        .icon {
          font-size: 28px;
          color: white;
          transition: all 0.3s;
        }

        .quick-actions-button.active .icon {
          transform: rotate(-45deg);
        }

        .quick-actions-menu {
          position: fixed;
          bottom: 90px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 999;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: white;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: all 0.2s;
          min-width: 180px;
        }

        .action-item:hover {
          transform: translateX(-5px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        }

        .action-item.qr-scan {
          background: linear-gradient(135deg, #9b59b6, #8e44ad);
          color: white;
        }

        .action-item.new-item {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          color: white;
        }

        .action-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .action-label {
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .quick-actions-button {
            right: 15px;
            bottom: 15px;
            width: 56px;
            height: 56px;
          }

          .quick-actions-menu {
            right: 15px;
            bottom: 80px;
          }

          .action-item {
            min-width: auto;
          }

          .action-label {
            display: none;
          }

          .action-item {
            width: 56px;
            height: 56px;
            padding: 0;
            justify-content: center;
            border-radius: 50%;
          }
        }
      `}</style>
    </>
  );
};

export default QuickActions;
