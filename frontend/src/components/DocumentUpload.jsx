/**
 * DocumentUpload komponens - Dokumentum feltöltés
 * Frontend Developer: Sarah Kim
 * JAVÍTVA: style jsx eltávolítva, inline stílusok használata
 */

import React, { useState } from 'react';
import { documentsAPI } from '../services/api';

// Stílusok objektumként (style jsx helyett)
const styles = {
  documentUpload: {
    marginTop: '20px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  heading: {
    margin: '0 0 15px 0',
    color: '#333'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 500,
    color: '#555'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  btn: {
    display: 'inline-block',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    textAlign: 'center',
    background: '#6c757d',
    color: 'white'
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};

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
      // JAVÍTVA: documentsAPI használata a Mixed Content elkerüléséhez
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
      alert(`Hiba történt a dokumentum feltöltésekor!\n\n${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.documentUpload}>
      <h4 style={styles.heading}>📎 Dokumentumok feltöltése</h4>
      
      <div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Dokumentum típusa:</label>
          <select 
            value={documentType} 
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={uploading}
            style={styles.select}
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Leírás (opcionális):</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="pl. Garancia 2 év, 2023-ig érvényes"
            disabled={uploading}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.odt,.ods,.rtf"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <span style={{
              ...styles.btn,
              ...(uploading ? styles.btnDisabled : {})
            }}>
              {uploading ? '⏳ Feltöltés...' : '📎 Dokumentum kiválasztása'}
            </span>
          </label>
          <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
            Támogatott: PDF, Word, Excel, TXT (max 20MB)
          </small>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
