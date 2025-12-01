/**
 * ItemPreview Game UI - Tárgy előnézet modal
 * PONTOSAN UGYANAZ mint az App-game-ui.jsx preview része
 */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { imagesAPI, documentsAPI } from '../services/api';
import '../styles/inventory-game-ui.css';

function ItemPreviewGameUI({ item, onClose, onEdit }) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (item?.id) {
      loadDocuments();
    }
    setPreviewIndex(0);
  }, [item]);

  const loadDocuments = async () => {
    try {
      const docs = await documentsAPI.getByItemId(item.id);
      setDocuments(docs || []);
    } catch (error) {
      console.error('Documents load error:', error);
    }
  };

  if (!item) return null;

  const gallery = (item.images && item.images.length > 0
    ? item.images
    : (item.image_filename ? [{ filename: item.image_filename, orientation: null }] : [])
  );
  const active = gallery[previewIndex] || gallery[0];

  const handleClose = () => {
    setPreviewIndex(0);
    onClose();
  };

  return createPortal(
    <div className="game-modal-overlay" onClick={handleClose}>
      <div 
        className="game-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '980px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="game-modal-header" style={{ flexShrink: 0 }}>
          <span>👁️ Előnézet</span>
          <div className="game-modal-close" onClick={handleClose}>✕</div>
        </div>
        <div style={{ 
          padding: '20px', 
          display: 'grid', 
          gap: '16px',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0
        }}>
          {/* Képgaléria */}
          <div className="preview-gallery-main">
            {active ? (
              <div 
                className={`preview-main-frame ${active.orientation || 'square'}`} 
                onClick={() => setPreviewIndex((previewIndex + 1) % gallery.length)}
              >
                <img src={imagesAPI.getImageUrl(active.filename)} alt={item.name} />
                {gallery.length > 1 && (
                  <div className="preview-nav">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewIndex((previewIndex - 1 + gallery.length) % gallery.length); }}>◀</button>
                    <span>{previewIndex + 1} / {gallery.length}</span>
                    <button onClick={(e) => { e.stopPropagation(); setPreviewIndex((previewIndex + 1) % gallery.length); }}>▶</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="preview-main-frame empty">Nincs kép</div>
            )}
            {gallery.length > 1 && (
              <div className="preview-thumbs">
                {gallery.map((img, idx) => (
                  <button
                    key={img.filename}
                    className={`preview-thumb ${idx === previewIndex ? 'active' : ''}`}
                    onClick={() => setPreviewIndex(idx)}
                  >
                    <img src={imagesAPI.getThumbnailUrl(img.filename)} alt={item.name} />
                    <small>{img.orientation === 'portrait' ? 'Álló' : img.orientation === 'landscape' ? 'Fekvő' : 'Kép'}</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tárgy adatok */}
          <div className="game-item-meta">
            <div className="game-item-meta-row">
              <span className="game-item-meta-label">🏷️ Név:</span>
              <span className="game-item-meta-value">{item.name}</span>
            </div>
            <div className="game-item-meta-row">
              <span className="game-item-meta-label">📂 Kategória:</span>
              <span className="game-item-meta-value">{item.category}</span>
            </div>
            {item.purchase_price && (
              <div className="game-item-meta-row">
                <span className="game-item-meta-label">💰 Ár:</span>
                <span className="game-item-meta-value">{item.purchase_price.toLocaleString()} Ft</span>
              </div>
            )}
            {item.location?.full_path && (
              <div className="game-item-meta-row">
                <span className="game-item-meta-label">📍 Hely:</span>
                <span className="game-item-meta-value">{item.location.full_path}</span>
              </div>
            )}
            {item.user?.display_name && (
              <div className="game-item-meta-row">
                <span className="game-item-meta-label">👤 Tulajdonos:</span>
                <span className="game-item-meta-value">{item.user.display_name}</span>
              </div>
            )}
            {item.quantity && (
              <div className="game-item-meta-row">
                <span className="game-item-meta-label">📦 Mennyiség:</span>
                <span className="game-item-meta-value">{item.quantity} db</span>
              </div>
            )}
            {item.purchase_date && (
              <div className="game-item-meta-row">
                <span className="game-item-meta-label">📅 Vásárlás:</span>
                <span className="game-item-meta-value">{new Date(item.purchase_date).toLocaleDateString('hu-HU')}</span>
              </div>
            )}
            {item.warranty_until && (
              <div className="game-item-meta-row">
                <span className="game-item-meta-label">🛡️ Garancia:</span>
                <span className="game-item-meta-value">{new Date(item.warranty_until).toLocaleDateString('hu-HU')}</span>
              </div>
            )}
            {item.description && (
              <div className="game-item-meta-row">
                <span className="game-item-meta-label">📝 Leírás:</span>
                <span className="game-item-meta-value">{item.description}</span>
              </div>
            )}
          </div>

          {/* Dokumentumok */}
          {(documents.length > 0 || item.documents?.length > 0) && (
            <div className="preview-documents">
              <h4>📄 Dokumentumok</h4>
              <div className="preview-doc-list">
                {(documents.length > 0 ? documents : item.documents).map(doc => (
                  <a
                    key={doc.id}
                    className="preview-doc-item"
                    href={documentsAPI.getDownloadUrl(doc.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📎 {doc.original_filename || doc.filename}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* QR kód */}
          {item.qr_code && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <h4 style={{ marginBottom: '10px', color: 'var(--game-brown)' }}>📱 QR Kód</h4>
              <img 
                src={`/qr_codes/${item.qr_code}`} 
                alt="QR kód"
                style={{ 
                  maxWidth: '150px', 
                  border: '2px solid var(--game-brown)', 
                  borderRadius: '8px',
                  background: 'white',
                  padding: '10px'
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end',
          padding: '15px 20px',
          borderTop: 'var(--border-medium) solid var(--game-brown)',
          background: 'var(--game-cream-light)',
          flexShrink: 0
        }}>
          <button 
            className="game-btn" 
            onClick={() => { 
              handleClose(); 
              onEdit?.(item); 
            }}
          >
            ✏️ Szerkesztés
          </button>
          <button className="game-btn game-btn-secondary" onClick={handleClose}>
            Bezár
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ItemPreviewGameUI;
