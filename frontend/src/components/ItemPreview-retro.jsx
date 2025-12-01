/**
 * ItemPreview Retro - Tárgy előnézet modal (Retro stílus)
 * Kiemelve az App.jsx-ből
 */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { imagesAPI, documentsAPI } from '../services/api';
import '../styles/retro-sketch.css';

function ItemPreviewRetro({ item, onClose, onEdit }) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (item?.id) {
      loadDocuments();
    }
    // Reset index when item changes
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

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '500px', 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h2 className="modal-title">👁️ Előnézet</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body" style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingBottom: '80px' 
        }}>
          {/* Képgaléria */}
          {active && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img 
                src={imagesAPI.getImageUrl(active.filename)} 
                alt={item.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  objectFit: 'contain'
                }}
              />
              {gallery.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px', 
                  marginTop: '10px' 
                }}>
                  <button 
                    className="icon-btn"
                    onClick={() => setPreviewIndex((previewIndex - 1 + gallery.length) % gallery.length)}
                  >
                    ◀
                  </button>
                  <span>{previewIndex + 1} / {gallery.length}</span>
                  <button 
                    className="icon-btn"
                    onClick={() => setPreviewIndex((previewIndex + 1) % gallery.length)}
                  >
                    ▶
                  </button>
                </div>
              )}
              {gallery.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '5px', 
                  justifyContent: 'center', 
                  flexWrap: 'wrap',
                  marginTop: '10px'
                }}>
                  {gallery.map((img, idx) => (
                    <button
                      key={img.filename}
                      onClick={() => setPreviewIndex(idx)}
                      style={{
                        padding: '2px',
                        border: idx === previewIndex ? '2px solid var(--primary-color)' : '2px solid transparent',
                        borderRadius: '4px',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <img 
                        src={imagesAPI.getThumbnailUrl(img.filename)}
                        alt=""
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tárgy adatok */}
          <div style={{ display: 'grid', gap: '10px' }}>
            <div><strong>📛 Név:</strong> {item.name}</div>
            <div><strong>📂 Kategória:</strong> {item.category}</div>
            {item.purchase_price && (
              <div><strong>💰 Ár:</strong> {item.purchase_price.toLocaleString()} Ft</div>
            )}
            {item.location?.full_path && (
              <div><strong>📍 Hely:</strong> {item.location.full_path}</div>
            )}
            {item.user?.display_name && (
              <div><strong>👤 Tulajdonos:</strong> {item.user.display_name}</div>
            )}
            {item.quantity && (
              <div><strong>📦 Mennyiség:</strong> {item.quantity} db</div>
            )}
            {item.purchase_date && (
              <div><strong>📅 Vásárlás:</strong> {new Date(item.purchase_date).toLocaleDateString('hu-HU')}</div>
            )}
            {item.warranty_until && (
              <div><strong>🛡️ Garancia:</strong> {new Date(item.warranty_until).toLocaleDateString('hu-HU')}</div>
            )}
            {item.description && (
              <div><strong>📝 Leírás:</strong> {item.description}</div>
            )}

            {/* Dokumentumok */}
            {documents.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong>📄 Dokumentumok:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                  {documents.map(doc => (
                    <a
                      key={doc.id}
                      href={documentsAPI.getDownloadUrl(doc.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        background: '#f0f0f0',
                        borderRadius: '5px',
                        textDecoration: 'none',
                        color: '#333',
                        fontSize: '12px'
                      }}
                    >
                      📎 {doc.original_filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* QR kód */}
            {item.qr_code && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <strong>📱 QR Kód:</strong>
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={`/qr_codes/${item.qr_code}`} 
                    alt="QR kód"
                    style={{ maxWidth: '150px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer gombok */}
        <div style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '15px 20px',
          background: 'white',
          borderTop: '1px solid #eee',
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'center'
        }}>
          <button 
            className="add-button"
            onClick={() => { 
              onClose();
              onEdit?.(item); 
            }}
          >
            ✏️ Szerkesztés
          </button>
          <button 
            className="category-btn"
            onClick={onClose}
          >
            Bezár
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ItemPreviewRetro;

