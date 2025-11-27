/**
 * DocumentUpload Game UI - Dokumentum feltöltés game stílussal
 * Frontend Developer: Sarah Kim
 * Game UI Design: Claude AI
 */

import React, { useState } from 'react';
import { documentsAPI } from '../services/api';

const DocumentUploadGameUI = ({ itemId, onDocumentUploaded }) => {
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

    // File size check (20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('❌ A fájl túl nagy! Maximum 20MB lehet.');
      e.target.value = '';
      return;
    }

    console.log('📄 Dokumentum feltöltés indítása...', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });

    setUploading(true);

    try {
      const data = await documentsAPI.upload(itemId, file, documentType, description);
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
      const serverMessage = error.response?.data?.detail || error.message;
      alert(`Hiba történt a dokumentum feltöltésekor!\n\n${serverMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{
          display: 'block',
          marginBottom: '5px',
          fontWeight: '600',
          color: 'var(--game-brown)',
          fontFamily: 'var(--font-text)'
        }}>
          Dokumentum típusa:
        </label>
        <select 
          className="game-search-input"
          value={documentType} 
          onChange={(e) => setDocumentType(e.target.value)}
          disabled={uploading}
          style={{ marginBottom: 0 }}
        >
          {documentTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{
          display: 'block',
          marginBottom: '5px',
          fontWeight: '600',
          color: 'var(--game-brown)',
          fontFamily: 'var(--font-text)'
        }}>
          Leírás (opcionális):
        </label>
        <input
          type="text"
          className="game-search-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="pl. Garancia 2 év, 2025-ig érvényes"
          disabled={uploading}
          style={{ marginBottom: 0 }}
        />
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '10px',
          cursor: uploading ? 'not-allowed' : 'pointer'
        }}>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.odt,.ods,.rtf"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <span className={`game-btn ${uploading ? '' : 'game-btn-secondary'}`} style={{
            width: '100%',
            display: 'block',
            textAlign: 'center',
            opacity: uploading ? 0.6 : 1,
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}>
            {uploading ? '⏳ Feltöltés...' : '📎 Dokumentum kiválasztása'}
          </span>
        </label>
        <small style={{ 
          display: 'block', 
          textAlign: 'center',
          color: 'var(--game-brown-medium)',
          fontFamily: 'var(--font-text)',
          fontSize: '13px'
        }}>
          Támogatott: PDF, Word, Excel, TXT, OpenDocument (max 20MB)
        </small>
      </div>
    </div>
  );
};

export default DocumentUploadGameUI;
