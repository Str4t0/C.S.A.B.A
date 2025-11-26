/**
 * QRScanner komponens - QR kód beolvasás kamerával
 * Frontend Developer: Sarah Kim
 */

import React, { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setScanning(true);
      setError(null);

      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      // Kamera indítása
      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('Nem található kamera');
      }

      // Hátsó kamera preferálása mobilon
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      
      const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

      // Folyamatos szkennelés
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            console.log('✅ QR kód beolvasva:', result.text);
            handleScanResult(result.text);
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('Szkennelési hiba:', error);
          }
        }
      );

    } catch (err) {
      console.error('Kamera hiba:', err);
      setError(err.message || 'Nem sikerült elindítani a kamerát');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  const handleScanResult = (qrCode) => {
    stopScanning();
    
    // QR kód formátum ellenőrzés: ITEM-{id}-{qr_code_id} vagy ITM-{qr_code_id}
    let qrCodeId = qrCode;
    
    if (qrCode.startsWith('ITEM-')) {
      // Formátum: ITEM-1-ITM-A1B2C3D4 -> ITM-A1B2C3D4
      const parts = qrCode.split('-');
      if (parts.length >= 3) {
        qrCodeId = parts.slice(2).join('-');
      }
    }
    
    if (onScan) {
      onScan(qrCodeId);
    }
  };

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-modal">
        <div className="qr-scanner-header">
          <h3>📷 QR Kód Beolvasása</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <div className="qr-scanner-body">
          {error ? (
            <div className="error-message">
              <p>❌ {error}</p>
              <button onClick={startScanning}>🔄 Újrapróbálás</button>
            </div>
          ) : (
            <>
              <div className="video-container">
                <video ref={videoRef} className="scanner-video" />
                <div className="scanner-frame">
                  <div className="scanner-corner tl"></div>
                  <div className="scanner-corner tr"></div>
                  <div className="scanner-corner bl"></div>
                  <div className="scanner-corner br"></div>
                </div>
              </div>
              <p className="scanner-hint">Helyezd a QR kódot a keretbe</p>
            </>
          )}
        </div>

        <div className="qr-scanner-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Mégse
          </button>
        </div>
      </div>

      <style jsx>{`
        .qr-scanner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .qr-scanner-modal {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .qr-scanner-header {
          padding: 20px;
          border-bottom: 2px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .qr-scanner-header h3 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 32px;
          height: 32px;
        }

        .close-btn:hover {
          color: #e74c3c;
        }

        .qr-scanner-body {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .video-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          aspect-ratio: 1;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }

        .scanner-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .scanner-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70%;
          height: 70%;
          pointer-events: none;
        }

        .scanner-corner {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 3px solid #3498db;
        }

        .scanner-corner.tl {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
        }

        .scanner-corner.tr {
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
        }

        .scanner-corner.bl {
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
        }

        .scanner-corner.br {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
        }

        .scanner-hint {
          margin-top: 20px;
          color: #666;
          text-align: center;
        }

        .error-message {
          text-align: center;
          padding: 20px;
        }

        .error-message p {
          color: #e74c3c;
          margin-bottom: 15px;
        }

        .error-message button {
          padding: 10px 20px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .qr-scanner-footer {
          padding: 20px;
          border-top: 2px solid #e0e0e0;
          display: flex;
          justify-content: center;
        }

        .btn {
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
