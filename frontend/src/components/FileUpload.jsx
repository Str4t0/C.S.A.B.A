/**
 * FileUpload komponens - Drag & Drop képfeltöltés
 * Frontend Developer: Sarah Kim
 */

import React, { useEffect, useState } from 'react';
import { imagesAPI } from '../services/api';
import CameraCapture from './CameraCapture';

const FileUpload = ({ onImageUploaded, currentImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage ? imagesAPI.getImageUrl(currentImage) : null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState(currentImage || null);

  useEffect(() => {
    if (currentImage) {
      setPreview(imagesAPI.getImageUrl(currentImage));
      setUploadedFilename(currentImage);
    } else {
      setPreview(null);
      setUploadedFilename(null);
    }
  }, [currentImage]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    console.log('📸 Kép feltöltés indítása...', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });

    // Fájl validáció
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error('❌ Érvénytelen fájl típus:', file.type);
      alert(`Csak JPG, PNG vagy WebP formátumú képeket tölthetsz fel!\n\nJelenlegi típus: ${file.type}`);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB (növelve mobilhoz)
    if (file.size > maxSize) {
      console.error('❌ Fájl túl nagy:', file.size);
      alert(`A fájl túl nagy! Maximum 10MB méretű lehet.\n\nJelenlegi méret: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      return;
    }

    setUploading(true);

    try {
      console.log('📤 Feltöltés a backend-re...');
      const response = await imagesAPI.upload(file);
      console.log('✅ Feltöltés sikeres!', response);
      
      setUploadedFilename(response.filename);
      const imageUrl = imagesAPI.getImageUrl(response.filename);
      console.log('🖼️ Kép URL:', imageUrl);
      setPreview(imageUrl);
      onImageUploaded(response.filename);
      
      // Sikeres feltöltés jelzése
      alert('✅ Kép sikeresen feltöltve!');
    } catch (error) {
      console.error('❌ Feltöltési hiba:', error);
      console.error('Hiba részletei:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Hiba történt a kép feltöltése során!';
      if (error.response?.status === 413) {
        errorMessage = 'A kép túl nagy! Próbálj kisebb felbontást használni.';
      } else if (error.response?.status === 0 || error.message.includes('Network Error')) {
        errorMessage = 'Nem sikerült kapcsolódni a szerverhez!\n\nEllenőrizd:\n- Backend fut? (http://'+window.location.hostname+':8000)\n- Ugyanazon a hálózaton vagy?\n- Tűzfal nem blokkolja?';
      } else if (error.response?.data?.detail) {
        errorMessage = `Szerver hiba: ${error.response.data.detail}`;
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = async (file) => {
    console.log('📷 Kamera kép készítve, feltöltés...', file.name);
    setShowCamera(false);
    // JAVÍTVA: várjuk meg az uploadFile befejezését, mielőtt bezárjuk a kamerát
    try {
      await uploadFile(file);
      console.log('✅ Kamera kép sikeresen feltöltve');
    } catch (error) {
      console.error('❌ Kamera kép feltöltési hiba:', error);
      // A hiba már kezelve van az uploadFile-ban
    }
  };

  const removeImage = () => {
    setPreview(null);
    setUploadedFilename(null);
    onImageUploaded(null);
  };

  return (
    <>
      {/* Camera Modal */}
      {showCamera && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <CameraCapture 
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Kép</label>
        
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <button 
              type="button"
              className="remove-image-btn"
              onClick={removeImage}
              title="Kép eltávolítása"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <div 
              className={`file-upload-area ${isDragging ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* JAVÍTVA: Hidden input + label mobilbarát megoldás */}
              <input 
                type="file" 
                id="file-upload-input"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                capture="environment"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              
              <label 
                htmlFor="file-upload-input"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  textAlign: 'center'
                }}
              >
                <div className="upload-icon">
                  {uploading ? '⏳' : '📸'}
                </div>
                
                <p>
                  {uploading 
                    ? 'Feltöltés folyamatban...' 
                    : 'Kattints ide - Fotó vagy galéria'}
                </p>
                <small style={{ color: 'var(--text-secondary)' }}>
                  Mobil: kamera vagy galéria | PC: fájl vagy drag & drop
                </small>
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '5px' }}>
                  JPG, PNG vagy WebP (max 10MB)
                </small>
              </label>
            </div>

            {/* Kamera gomb - csak akkor jelenik meg, ha a kamera elérhető */}
            {(navigator.mediaDevices || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) && (
              <button 
                type="button"
                className="camera-btn"
                onClick={() => setShowCamera(true)}
                disabled={uploading}
              >
                📷 Fotó készítése böngésző kamerával
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default FileUpload;
