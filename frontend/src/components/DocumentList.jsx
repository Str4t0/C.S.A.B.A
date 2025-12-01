/**
 * DocumentList komponens - Dokumentumok listázása
 * Frontend Developer: Sarah Kim
 */

import React, { useState, useEffect } from 'react';
import { documentsAPI } from '../services/api';

const DocumentList = ({ itemId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [itemId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsAPI.getByItemId(itemId);
      setDocuments(data || []);
    } catch (error) {
      console.error('Dokumentumok betöltési hiba:', error);
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
      loadDocuments();  // Reload list
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
    return <div className="document-list-loading">Dokumentumok betöltése...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="no-documents">
        <p>📭 Még nincs feltöltött dokumentum</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      <h4>📎 Dokumentumok ({documents.length})</h4>
      
      <div className="documents-grid">
        {documents.map(doc => (
          <div key={doc.id} className="document-card">
            <div className="document-icon">
              {getDocumentIcon(doc.original_filename)}
            </div>
            
            <div className="document-info">
              <div className="document-name" title={doc.original_filename}>
                {doc.original_filename}
              </div>
              
              {doc.document_type && (
                <div className="document-type">
                  {getDocumentTypeLabel(doc.document_type)}
                </div>
              )}
              
              {doc.description && (
                <div className="document-description">
                  {doc.description}
                </div>
              )}
              
              <div className="document-meta">
                <span>{formatFileSize(doc.file_size)}</span>
                <span>•</span>
                <span>{formatDate(doc.uploaded_at)}</span>
              </div>
            </div>
            
            <div className="document-actions">
              <button
                className="btn-icon btn-download"
                onClick={() => handleDownload(doc)}
                title="Letöltés"
              >
                ⬇️
              </button>
              <button
                className="btn-icon btn-delete"
                onClick={() => handleDelete(doc.id)}
                title="Törlés"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .document-list {
          margin-top: 20px;
        }

        .document-list h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .document-list-loading,
        .no-documents {
          padding: 30px;
          text-align: center;
          color: #666;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .documents-grid {
          display: grid;
          gap: 12px;
        }

        .document-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .document-card:hover {
          border-color: #3498db;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .document-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .document-info {
          flex: 1;
          min-width: 0;
        }

        .document-name {
          font-weight: 600;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .document-type {
          font-size: 13px;
          color: #3498db;
          margin-bottom: 4px;
        }

        .document-description {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .document-meta {
          font-size: 12px;
          color: #999;
          display: flex;
          gap: 6px;
        }

        .document-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: #f0f0f0;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-download:hover {
          background: #3498db;
          transform: scale(1.1);
        }

        .btn-delete:hover {
          background: #e74c3c;
          transform: scale(1.1);
        }

        @media (max-width: 600px) {
          .document-card {
            flex-wrap: wrap;
          }

          .document-actions {
            width: 100%;
            justify-content: center;
            padding-top: 8px;
            border-top: 1px solid #f0f0f0;
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentList;
