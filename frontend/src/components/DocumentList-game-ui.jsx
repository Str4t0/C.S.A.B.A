/**
 * DocumentList Game UI - Dokumentumok listázása game stílussal
 * Frontend Developer: Sarah Kim
 * Game UI Design: Claude AI
 */

import React, { useState, useEffect } from 'react';
import { documentsAPI } from '../services/api';

const DocumentListGameUI = ({ itemId, refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [itemId, refreshTrigger]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsAPI.getByItem(itemId);
      setDocuments(data || []);
    } catch (error) {
      console.error('Dokumentumok betöltési hiba:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a dokumentumot?')) {
      return;
    }

    try {
      await documentsAPI.delete(documentId);
      alert('✅ Dokumentum törölve!');
      loadDocuments();
    } catch (error) {
      console.error('Törlési hiba:', error);
      alert('❌ Hiba történt a törlés során!');
    }
  };

  const handleDownload = (document) => {
    const downloadUrl = documentsAPI.getDownloadUrl(document.id);
    window.open(downloadUrl, '_blank');
  };

  const getDocumentIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      'pdf': '📕',
      'doc': '📘',
      'docx': '📘',
      'txt': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'csv': '📊',
      'odt': '📄',
      'ods': '📄',
      'rtf': '📄'
    };
    return icons[ext] || '📄';
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      'garancia': '📋 Garancia',
      'szamla': '🧾 Számla',
      'kezikonyv': '📖 Kézikönyv',
      'szerzodes': '📄 Szerződés',
      'biztositas': '🛡️ Biztosítás',
      'egyeb': '📎 Egyéb'
    };
    return labels[type] || '📄 Dokumentum';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        padding: '30px',
        textAlign: 'center',
        color: 'var(--game-brown-medium)',
        background: 'var(--game-cream)',
        border: 'var(--border-thin) solid var(--game-brown)',
        borderRadius: 'var(--radius-small)',
        fontFamily: 'var(--font-text)'
      }}>
        ⏳ Dokumentumok betöltése...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div style={{
        padding: '30px',
        textAlign: 'center',
        background: 'var(--game-cream)',
        border: 'var(--border-thin) solid var(--game-brown)',
        borderRadius: 'var(--radius-small)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
        <p style={{
          margin: 0,
          color: 'var(--game-brown-medium)',
          fontFamily: 'var(--font-text)',
          fontSize: '16px'
        }}>
          Még nincs feltöltött dokumentum
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: 'var(--border-thin) solid var(--game-brown)'
      }}>
        <h4 style={{
          fontFamily: 'var(--font-game)',
          fontSize: '20px',
          color: 'var(--game-brown)',
          margin: 0
        }}>
          📎 Dokumentumok ({documents.length})
        </h4>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {documents.map(doc => (
          <div key={doc.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '15px',
            background: 'var(--game-cream)',
            border: 'var(--border-thin) solid var(--game-brown)',
            borderRadius: 'var(--radius-small)',
            transition: 'all 0.2s'
          }}>
            <div style={{
              fontSize: '32px',
              flexShrink: 0
            }}>
              {getDocumentIcon(doc.original_filename)}
            </div>
            
            <div style={{
              flex: 1,
              minWidth: 0,
              fontFamily: 'var(--font-text)'
            }}>
              <div style={{
                fontWeight: 600,
                color: 'var(--game-brown)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '4px',
                fontSize: '15px'
              }} title={doc.original_filename}>
                {doc.original_filename}
              </div>
              
              {doc.document_type && (
                <div style={{
                  fontSize: '13px',
                  color: 'var(--game-blue)',
                  marginBottom: '4px',
                  fontWeight: 600
                }}>
                  {getDocumentTypeLabel(doc.document_type)}
                </div>
              )}
              
              {doc.description && (
                <div style={{
                  fontSize: '13px',
                  color: 'var(--game-brown-medium)',
                  marginBottom: '4px',
                  lineHeight: 1.4
                }}>
                  {doc.description}
                </div>
              )}
              
              <div style={{
                fontSize: '12px',
                color: 'var(--game-brown-light)',
                display: 'flex',
                gap: '8px'
              }}>
                <span>{formatFileSize(doc.file_size)}</span>
                <span>•</span>
                <span>{formatDate(doc.uploaded_at)}</span>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              flexShrink: 0
            }}>
              <button
                onClick={() => handleDownload(doc)}
                title="Letöltés"
                style={{
                  width: '40px',
                  height: '40px',
                  border: 'var(--border-thin) solid var(--game-brown)',
                  borderRadius: '50%',
                  background: 'var(--game-cream-light)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--game-blue)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'var(--game-cream-light)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ⬇️
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                title="Törlés"
                style={{
                  width: '40px',
                  height: '40px',
                  border: 'var(--border-thin) solid var(--game-brown)',
                  borderRadius: '50%',
                  background: 'var(--game-cream-light)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--game-red)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'var(--game-cream-light)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentListGameUI;
