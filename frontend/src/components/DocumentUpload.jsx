/**
 * DocumentUpload komponens - Dokumentum feltöltés
 * Frontend Developer: Sarah Kim
 */

import React, { useState } from 'react';

const DocumentUpload = ({ itemId, onDocumentUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');

  const documentTypes = [
    { value: '', label: 'Válassz típust...' },
    { value: 'garancia', label: '📋 Garancia' },
    { value: 'szamla', label: '🧾 Számla' },
    { value: 'kezikonyv', label: '📖 Kézikönyv' },
    { value: 'szerzodes', label: '📄 Szerződés' },
    { value: 'biztositas', label: '🛡️ Biztosítás' },
    { value: 'egyeb', label: '📎 Egyéb' }
  ];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('📄 Dokumentum feltöltés indítása...', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (documentType) formData.append('document_type', documentType);
      if (description) formData.append('description', description);

      const backendURL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8000'
        : `http://${window.location.hostname}:8000`;

      console.log('📤 Feltöltés...', backendURL);

      const response = await fetch(`${backendURL}/api/items/${itemId}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Feltöltési hiba');
      }

      const data = await response.json();
      console.log('✅ Dokumentum feltöltve!', data);

      alert(`✅ Dokumentum sikeresen feltöltve!\n\n${file.name}`);

      // Reset form
      setDocumentType('');
      setDescription('');
      e.target.value = '';

      if (onDocumentUploaded) {
        onDocumentUploaded(data);
      }

    } catch (error) {
      console.error('❌ Feltöltési hiba:', error);
      alert(`Hiba történt a dokumentum feltöltésekor!\n\n${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload">
      <h4>📎 Dokumentumok feltöltése</h4>
      
      <div className="document-upload-form">
        <div className="form-group">
          <label>Dokumentum típusa:</label>
          <select 
            value={documentType} 
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={uploading}
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Leírás (opcionális):</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="pl. Garancia 2 év, 2023-ig érvényes"
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label className="document-upload-btn">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.odt,.ods,.rtf"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <span className="btn btn-secondary">
              {uploading ? '⏳ Feltöltés...' : '📎 Dokumentum kiválasztása'}
            </span>
          </label>
          <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
            Támogatott: PDF, Word, Excel, TXT (max 20MB)
          </small>
        </div>
      </div>

      <style jsx>{`
        .document-upload {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .document-upload h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .document-upload-form .form-group {
          margin-bottom: 15px;
        }

        .document-upload-form label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }

        .document-upload-form select,
        .document-upload-form input[type="text"] {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .document-upload-btn {
          cursor: pointer;
        }

        .btn {
          display: inline-block;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5a6268;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default DocumentUpload;
