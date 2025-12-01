import React, { useEffect, useRef, useState } from 'react';
import { imagesAPI, itemsAPI } from '../services/api';
import CameraCapture from './CameraCapture';

const MultiImageUpload = ({ initialImages = [], onChange, itemId }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

  const emitChange = (nextImages) => {
    setImages(nextImages);
    console.log('📸 MultiImageUpload: emitChange', { 
      count: nextImages?.length || 0, 
      images: nextImages 
    });
    onChange?.(nextImages);
  };

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    try {
      const uploads = [];
      for (const file of fileList) {
        uploads.push(uploadFile(file));
      }
      const results = await Promise.all(uploads);
      const filtered = results.filter(Boolean);
      emitChange([...(images || []), ...filtered]);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const uploadFile = async (file) => {
    console.log('📤📤📤 uploadFile hívva!', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      isFile: file instanceof File
    });

    if (!file) {
      console.error('❌ File hiányzik!');
      return null;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error('❌ Érvénytelen fájl típus:', file.type);
      alert('Csak JPG, PNG vagy WebP formátumú képeket tölthetsz fel!');
      return null;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('❌ Fájl túl nagy:', file.size);
      alert('A kép túl nagy! Maximum 10MB lehet.');
      return null;
    }

    try {
      console.log('📤 Feltöltés indítása a backend-re...');
      const response = await imagesAPI.upload(file);
      console.log('✅ Upload response:', response);
      
      const result = {
        filename: response.filename,
        original_filename: response.original_filename || file.name || response.filename,
        orientation: response.orientation || null,
        width: response.width,
        height: response.height,
        url: imagesAPI.getImageUrl(response.filename)
      };
      
      console.log('✅ Upload result:', result);
      return result;
    } catch (error) {
      console.error('❌ Upload hiba:', error);
      console.error('Hiba részletek:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error; // Re-throw hogy a hívó kezelhesse
    }
  };

  const handleRemove = (filename) => {
    const next = images.filter((img) => img.filename !== filename);
    emitChange(next);
  };

  const handleCameraCapture = async (file) => {
    console.log('📷📷📷 handleCameraCapture hívva!', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      fileIsFile: file instanceof File,
      itemId: itemId
    });
    
    if (!file || !(file instanceof File)) {
      console.error('❌ Érvénytelen file objektum:', file);
      alert('Hiba: Érvénytelen fájl objektum!');
      setShowCamera(false);
      return;
    }

    setShowCamera(false);
    setUploading(true);
    
    try {
      console.log('📷 Kamera kép készítve, feltöltés indítása...', file.name);
      
      // JAVÍTVA: Ha van itemId, közvetlenül hozzáadjuk az itemhez az API-n keresztül
      if (itemId) {
        console.log('📷 ItemId megtalálva, közvetlenül hozzáadjuk az itemhez...', itemId);
        try {
          // Használjuk a POST /api/items/{item_id}/images endpoint-ot
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await itemsAPI.uploadImage(itemId, formData);
          console.log('✅ Kép közvetlenül hozzáadva az itemhez:', response);
          
          // Frissítsük a galériát az új képpel
          const newImage = {
            filename: response.filename,
            original_filename: response.original_filename || response.filename,
            orientation: response.orientation || null,
            url: imagesAPI.getImageUrl(response.filename)
          };
          
          // JAVÍTVA: setTimeout használata, hogy ne legyen render phase update warning
          setTimeout(() => {
            setImages(prevImages => {
              const newImages = [...(prevImages || []), newImage];
              console.log('📷 Új images state:', newImages);
              console.log('📷 emitChange hívása:', newImages.length, 'képpel');
              // JAVÍTVA: setTimeout-ban hívjuk az emitChange-et is
              setTimeout(() => emitChange(newImages), 0);
              return newImages;
            });
          }, 0);
          
          console.log('✅ Kamera kép sikeresen hozzáadva az itemhez és a galériához!');
        } catch (apiError) {
          console.error('❌ API hiba a kép hozzáadásakor:', apiError);
          // Ha az API hiba, próbáljuk meg a régi módszert (feltöltés + galéria)
          console.log('📷 Fallback: régi módszer (feltöltés + galéria)');
          const uploaded = await uploadFile(file);
          if (uploaded) {
            setImages(prevImages => {
              const newImages = [...(prevImages || []), uploaded];
              emitChange(newImages);
              return newImages;
            });
            console.log('✅ Kamera kép hozzáadva a galériához (fallback)');
          }
        }
      } else {
        // Nincs itemId (új item), csak feltöltjük és hozzáadjuk a galériához
        const uploaded = await uploadFile(file);
        console.log('📷 Feltöltés eredmény:', uploaded);
        
        if (uploaded) {
          setImages(prevImages => {
            const newImages = [...(prevImages || []), uploaded];
            console.log('📷 Új images state:', newImages);
            console.log('📷 emitChange hívása:', newImages.length, 'képpel');
            emitChange(newImages);
            return newImages;
          });
          console.log('✅ Kamera kép sikeresen hozzáadva a galériához!');
        } else {
          console.error('❌ Feltöltés sikertelen: uploaded is null');
          alert('Hiba: A kép feltöltése sikertelen volt!');
        }
      }
    } catch (error) {
      console.error('❌ Kamera kép feltöltési hiba:', error);
      console.error('Hiba részletek:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      alert('Hiba történt a kép feltöltése során: ' + (error.message || 'Ismeretlen hiba'));
    } finally {
      setUploading(false);
    }
  };

  const renderThumb = (img) => {
    const orientationClass = img.orientation || (img.width && img.height
      ? (img.width > img.height ? 'landscape' : img.height > img.width ? 'portrait' : 'square')
      : 'square');

    return (
      <div key={img.filename} className={`multi-image-thumb ${orientationClass}`}>
        <img src={img.url || imagesAPI.getImageUrl(img.filename)} alt={img.filename} />
        <div className="multi-image-meta">
          <span>{orientationClass === 'portrait' ? 'Álló' : orientationClass === 'landscape' ? 'Fekvő' : 'Négyzet'}</span>
          <button type="button" onClick={() => handleRemove(img.filename)}>✕</button>
        </div>
      </div>
    );
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
            onCapture={(file) => {
              console.log('📷📷📷 CameraCapture onCapture callback hívva!', {
                fileName: file?.name,
                fileSize: file?.size,
                fileType: file?.type
              });
              handleCameraCapture(file);
            }}
            onClose={() => {
              console.log('📷 Kamera bezárva');
              setShowCamera(false);
            }}
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Képek</label>
        <div
          className={`file-upload-area multi ${isDragging ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="game-btn game-btn-small"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Feltöltés...' : '📤 Képek feltöltése'}
            </button>
            {/* Kamera gomb - csak akkor jelenik meg, ha a kamera elérhető */}
            {(navigator.mediaDevices || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) && (
              <button
                type="button"
                className="game-btn game-btn-small"
                onClick={() => setShowCamera(true)}
                disabled={uploading}
              >
                📷 Fotó készítése
              </button>
            )}
          </div>
          <p className="multi-image-help">Tölts fel több képet egyszerre, megtartjuk az álló/fekvő tájolást.</p>
        </div>

        {images?.length > 0 && (
          <div className="multi-image-grid">
            {images.map(renderThumb)}
          </div>
        )}
      </div>
    </>
  );
};

export default MultiImageUpload;
