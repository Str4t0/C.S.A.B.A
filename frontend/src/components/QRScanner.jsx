import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';
import '../styles/QRScanner.css';

const QRScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (scanning) return;

    try {
      setError(null);

      // Ellenőrizzük, hogy a böngésző támogatja-e a kamera streamet
      let cameras;
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch (cameraError) {
        throw new Error('A böngésző nem támogatja a kamera streamet. Engedélyezd a HTTPS-t vagy válaszd a képfeltöltéses beolvasást.');
      }

      if (!cameras || cameras.length === 0) {
        throw new Error('Nem található elérhető kamera eszköz.');
      }

      setScanning(true);

      // Várjunk egy render ciklust, hogy a #qr-reader elem biztosan létezzen
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const readerElement = document.getElementById('qr-reader');
      if (!readerElement) {
        throw new Error('A kamera előnézeti elem nem található');
      }

      // Initialize scanner
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      const preferredCameraId = cameras.find((cam) => cam.label?.toLowerCase().includes('back'))?.id || cameras[0].id;

      await html5QrCode.start(
        { deviceId: { exact: preferredCameraId } },
        config,
        async (decodedText) => {
          console.log('✅ QR kód beolvasva:', decodedText);

          // Stop scanner
          await stopScanner();

          // Lookup item
          await lookupItem(decodedText);
        },
        () => {
          // Scanning errors are noisy, ne logoljuk
        }
      );

      toast.success('Kamera indítva! Tartsd a QR kódot a keretbe.');
    } catch (err) {
      console.error('❌ Kamera indítási hiba:', err);
      const message = err?.message?.includes('nem támogatja a kamera streamet')
        ? 'A böngésző nem támogatja a kamera streamet. Használj HTTPS-t vagy olvass be egy mentett QR-képet.'
        : err?.message || 'Nem sikerült elindítani a kamerát.';
      setError(message);
      setScanning(false);
      toast.error('Kamera indítása sikertelen');
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // SCANNING
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
      setScanning(false);
    } catch (err) {
      console.error('Scanner stop hiba:', err);
    }
  };

  const lookupItem = async (qrCode) => {
    try {
      toast.loading('Tárgy keresése...', { id: 'lookup' });
      
      const response = await api.get(`/qr/scan/${qrCode}`);
      const item = response.data;
      
      toast.success('Tárgy megtalálva!', { id: 'lookup' });
      setScannedItem(item);
      
    } catch (error) {
      console.error('❌ Tárgy lookup hiba:', error);
      
      if (error.response?.status === 404) {
        toast.error('Nem található tárgy ezzel a QR kóddal', { id: 'lookup' });
        setError(`QR kód: ${qrCode} - Nem található a rendszerben`);
      } else {
        toast.error('Hiba a tárgy keresésekor', { id: 'lookup' });
        setError('Hálózati hiba történt');
      }
    }
  };

  const handleViewItem = () => {
    if (scannedItem) {
      navigate(`/items/${scannedItem.id}`);
    }
  };

  const handleScanAgain = () => {
    setScannedItem(null);
    setError(null);
    startScanner();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileScan = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setScanning(true);

      // A reader elemre a fájlos beolvasáshoz is szükség van
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const readerElement = document.getElementById('qr-reader');
      if (!readerElement) {
        throw new Error('A beolvasó felület nem található');
      }

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      }

      const result = html5QrCodeRef.current.scanFileV2
        ? await html5QrCodeRef.current.scanFileV2(file, true)
        : await html5QrCodeRef.current.scanFile(file, true);

      setScanning(false);
      await lookupItem(result.decodedText || result);
    } catch (err) {
      console.error('Kép beolvasási hiba:', err);
      setError('Nem sikerült beolvasni a képet. Próbáld újra másik képpel.');
      toast.error('Kép beolvasása sikertelen');
      setScanning(false);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="qr-scanner-container">
      {/* Header */}
      <div className="scanner-header">
        <h1>📷 QR Kód Beolvasó</h1>
        <p className="subtitle">Olvasd be a tárgy QR kódját</p>
      </div>

      {/* Scanner Area */}
      <div className="scanner-content">
        {!scanning && !scannedItem && !error && (
          <div className="scanner-start">
            <div className="start-icon">
              <Camera size={64} />
            </div>
            <h2>Készen állsz?</h2>
            <p>Tartsd a telefont a QR kód fölé</p>
            <button onClick={startScanner} className="start-btn">
              <Camera size={20} />
              Kamera indítása
            </button>
            <button onClick={triggerFileSelect} className="start-btn secondary-btn">
              📁 QR kód kép feltöltése
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileScan}
            />
          </div>
        )}

        {scanning && (
          <div className="scanner-active">
            <div id="qr-reader" className="qr-reader"></div>
            <div className="scanner-overlay">
              <div className="scanner-frame"></div>
              <p className="scanner-hint">Tartsd a QR kódot a keretbe</p>
            </div>
            <button onClick={stopScanner} className="stop-btn">
              <X size={20} />
              Leállítás
            </button>
          </div>
        )}

        {error && (
          <div className="scanner-error">
            <AlertCircle size={48} className="error-icon" />
            <h3>Hiba történt</h3>
            <p>{error}</p>
            <button onClick={handleScanAgain} className="retry-btn">
              Újra próbálom
            </button>
          </div>
        )}

        {scannedItem && (
          <div className="scanner-success">
            <CheckCircle size={64} className="success-icon" />
            <h2>Tárgy megtalálva!</h2>
            
            <div className="item-preview">
              {scannedItem.image_filename && (
                <img 
                  src={`/uploads/${scannedItem.image_filename}`}
                  alt={scannedItem.name}
                  className="item-image"
                />
              )}
              <div className="item-info">
                <h3 className="item-name">{scannedItem.name}</h3>
                <p className="item-category">{scannedItem.category}</p>
                <p className="item-qr">QR: {scannedItem.qr_code}</p>
                {scannedItem.location_name && (
                  <p className="item-location">📍 {scannedItem.location_name}</p>
                )}
                {scannedItem.quantity && (
                  <p className="item-quantity">📦 {scannedItem.quantity} db</p>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={handleViewItem} className="view-btn">
                Részletek megtekintése
              </button>
              <button onClick={handleScanAgain} className="scan-again-btn">
                Újabb beolvasás
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="scanner-info">
        <h3>💡 Tippek</h3>
        <ul>
          <li>Jó megvilágításnál használd</li>
          <li>Tartsd stabilan a telefont</li>
          <li>A QR kód legyen a keret közepén</li>
          <li>2-3 másodperc múlva automatikusan beolvassa</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;
