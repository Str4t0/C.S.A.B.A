import React, { useEffect, useRef, useState } from 'react';
import { imagesAPI } from '../services/api';

const MultiImageUpload = ({ initialImages = [], onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

  const emitChange = (nextImages) => {
    setImages(nextImages);
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
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Csak JPG, PNG vagy WebP formátumú képeket tölthetsz fel!');
      return null;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('A kép túl nagy! Maximum 10MB lehet.');
      return null;
    }

    const response = await imagesAPI.upload(file);
    return {
      filename: response.filename,
      orientation: response.orientation || null,
      width: response.width,
      height: response.height,
      url: imagesAPI.getImageUrl(response.filename)
    };
  };

  const handleRemove = (filename) => {
    const next = images.filter((img) => img.filename !== filename);
    emitChange(next);
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
        <button
          type="button"
          className="game-btn game-btn-small"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Feltöltés...' : '📤 Képek feltöltése'}
        </button>
        <p className="multi-image-help">Tölts fel több képet egyszerre, megtartjuk az álló/fekvő tájolást.</p>
      </div>

      {images?.length > 0 && (
        <div className="multi-image-grid">
          {images.map(renderThumb)}
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
