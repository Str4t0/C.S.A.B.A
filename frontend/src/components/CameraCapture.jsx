/**
 * CameraCapture komponens - Kamera használat mobilon/PC-n
 * Frontend Developer: Sarah Kim
 */

import React, { useRef, useState, useEffect } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Hátsó kamera mobilon
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error('Kamera hozzáférési hiba:', err);
      setError('Nem sikerült elérni a kamerát. Ellenőrizd a böngésző engedélyeket!');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          onCapture(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  if (error) {
    return (
      <div className="camera-container">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-color)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</p>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={onClose} style={{ marginTop: '1rem' }}>
            Bezárás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="camera-video"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="camera-controls">
        <button className="capture-btn" onClick={capturePhoto}>
          📸 Fényképezés
        </button>
        <button className="btn btn-secondary" onClick={() => {
          stopCamera();
          onClose();
        }}>
          Mégse
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
