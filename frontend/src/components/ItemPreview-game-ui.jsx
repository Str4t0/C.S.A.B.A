/**
 * ItemPreview Game UI - Tárgy előnézet modal (FULL FIXED)
 * Frontend Developer: AI Assistant
 * 
 * Javítások:
 * - Swipe left/right működik tárgyak között
 * - Modal fix háttér + központosítás
 * - QR kód mindig látszik
 * - Szélesség fix (nem mozog)
 */

import React, { useState, useEffect, useRef } from 'react';
import { imagesAPI, documentsAPI } from '../services/api';
import '../styles/inventory-game-ui.css';

function ItemPreviewGameUI({ item, onClose, onEdit, onNavigate }) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);

  // Swipe detection
  const minSwipeDistance = 50;

  useEffect(() => {
    // Load documents
    if (item.id) {
      loadDocuments();
    }

    // ESC key listener
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);

    return () => window.removeEventListener('keydown', handleEsc);
  }, [item]);

  const loadDocuments = async () => {
    try {
      const docs = await documentsAPI.getByItemId(item.id);
      setDocuments(docs || []);
    } catch (error) {
      console.error('Documents load error:', error);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd({ x: 0, y: 0 });
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;
    
    // Prioritize horizontal swipes for navigation
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onNavigate) {
        onNavigate('next');
      } else if (isRightSwipe && onNavigate) {
        onNavigate('prev');
      }
    } else {
      // Vertical swipe for close
      if (isDownSwipe) {
        onClose();
      }
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Elektronika': '⚡',
      'Bútorok': '🛋️',
      'Konyhai eszközök': '🍳',
      'Szerszámok': '🔧',
      'Műszaki cikkek': '📱',
      'Ruházat': '👕',
      'Könyvek': '📚',
      'Egyéb': '📦'
    };
    return iconMap[category] || '📦';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = (doc) => {
    const downloadUrl = documentsAPI.getDownloadUrl(doc.id);
    window.open(downloadUrl, '_blank');
  };

  const imageUrl = item.image_filename
    ? imagesAPI.getImageUrl(item.image_filename)
    : null;

  return (
    <>
      {/* Overlay - FIXED */}
      <div 
        className="game-modal-overlay"
        onClick={onClose}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,  // Menü (1000) felett
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',  // JAVÍTVA: kisebb padding mobilon
          overflow: 'hidden'  // JAVÍTVA: ne legyen overflow az overlay-en
        }}
      >
        {/* Modal Container - FIXED WIDTH */}
        <div 
          ref={modalRef}
          className="game-modal-container"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            height: '90vh',  // JAVÍTVA: 90vh mobilon is
            maxHeight: '90vh',  // JAVÍTVA: mobilon is működjön
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--game-cream-light)',
            border: 'var(--border-thick) solid var(--game-brown)',
            borderRadius: 'var(--radius-large)',
            boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
            zIndex: 10001,  // Overlay felett
            overflow: 'hidden'  // JAVÍTVA: ne legyen overflow a container-en
          }}
        >
          {/* Header */}
          <div style={{
            position: 'sticky',
            top: 0,
            background: 'var(--game-orange)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 15px',
            gap: '10px',
            borderBottom: 'var(--border-thick) solid var(--game-brown)',
            borderTopLeftRadius: 'var(--radius-large)',
            borderTopRightRadius: 'var(--radius-large)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-game)',
              fontSize: '18px',
              color: 'var(--game-cream)',
              margin: 0,
              textAlign: 'left',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.name}
            </h2>
            {/* X bezáró gomb a header-ben */}
            <button 
              className="game-btn game-btn-small"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                background: 'var(--game-red)',
                borderColor: 'var(--game-red-dark)',
                flexShrink: 0,
                minWidth: '40px',
                width: '40px',
                height: '40px',
                padding: '0',
                fontSize: '18px',
                borderRadius: '50%'
              }}
            >
              ✕
            </button>
          </div>

          {/* Content - JAVÍTVA: görgetés és padding */}
          <div style={{ 
            padding: '15px',
            paddingBottom: '15px',  // JAVÍTVA: nincs szükség extra padding-re, mert a footer flexbox-ban van
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            minHeight: 0,  // JAVÍTVA: flexbox overflow kezelés
            WebkitOverflowScrolling: 'touch',  // Smooth scrolling iOS-on
            scrollbarWidth: 'thin'  // Vékonyabb scrollbar Firefox-on
          }}>
            
            {/* Swipe indicator */}
            <div style={{
              textAlign: 'center',
              padding: '8px',
              background: 'var(--game-cream)',
              borderRadius: 'var(--radius-small)',
              marginBottom: '15px',
              fontSize: '12px',
              color: 'var(--game-brown-medium)',
              border: 'var(--border-thin) solid var(--game-brown)'
            }}>
              👈 Swipe balra/jobbra a tárgyak között 👉
            </div>

            {/* Image */}
            {imageUrl && (
              <div style={{
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <img
                  src={imageUrl}
                  alt={item.name}
                  onClick={() => setShowFullImage(true)}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: 'var(--radius-medium)',
                    border: 'var(--border-thick) solid var(--game-brown)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <p style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: '13px',
                  color: 'var(--game-brown-medium)',
                  marginTop: '8px'
                }}>
                  🔍 Kattints a kép nagyításához
                </p>
              </div>
            )}

            {/* Info Grid */}
            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              
              {/* Category */}
              {item.category && (
                <div className="game-preview-field">
                  <div className="game-preview-label">
                    {getCategoryIcon(item.category)} Kategória
                  </div>
                  <div className="game-preview-value">{item.category}</div>
                </div>
              )}

              {/* Quantity */}
              {item.quantity !== undefined && item.quantity !== null && (
                <div className="game-preview-field">
                  <div className="game-preview-label">📊 Mennyiség</div>
                  <div className="game-preview-value">
                    {item.quantity} db
                    {item.min_quantity && (
                      <span style={{ color: 'var(--game-brown-medium)' }}>
                        {' '}(min: {item.min_quantity})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {item.location && (
                <div className="game-preview-field">
                  <div className="game-preview-label">📍 Helyszín</div>
                  <div className="game-preview-value">
                    {item.location.full_path || item.location.name}
                  </div>
                </div>
              )}

              {/* Price */}
              {item.purchase_price && (
                <div className="game-preview-field">
                  <div className="game-preview-label">💰 Vásárlási ár</div>
                  <div className="game-preview-value">
                    {formatCurrency(item.purchase_price)}
                  </div>
                </div>
              )}

              {/* Purchase Date */}
              {item.purchase_date && (
                <div className="game-preview-field">
                  <div className="game-preview-label">📅 Vásárlás dátuma</div>
                  <div className="game-preview-value">
                    {formatDate(item.purchase_date)}
                  </div>
                </div>
              )}

              {/* User */}
              {item.user && (
                <div className="game-preview-field">
                  <div className="game-preview-label">👤 Felhasználó</div>
                  <div className="game-preview-value">
                    {item.user.display_name || item.user.username}
                  </div>
                </div>
              )}

              {/* Description */}
              {item.description && (
                <div className="game-preview-field" style={{
                  gridColumn: '1 / -1'
                }}>
                  <div className="game-preview-label">📝 Leírás</div>
                  <div className="game-preview-value" style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6
                  }}>
                    {item.description}
                  </div>
                </div>
              )}

              {/* QR Code - MINDIG LÁTSZIK */}
              {item.qr_code && (
                <div className="game-preview-field" style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  background: 'white'
                }}>
                  <div className="game-preview-label">🔲 QR Kód</div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    background: 'var(--game-cream)',
                    padding: '15px 20px',
                    borderRadius: 'var(--radius-medium)',
                    border: 'var(--border-medium) solid var(--game-brown)',
                    marginTop: '10px',
                    letterSpacing: '2px'
                  }}>
                    {item.qr_code}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: '12px',
                    color: 'var(--game-brown-medium)',
                    marginTop: '8px'
                  }}>
                    📱 QR kód vizuális megjelenítés hamarosan
                  </p>
                </div>
              )}

              {/* Documents */}
              {documents.length > 0 && (
                <div className="game-preview-field" style={{
                  gridColumn: '1 / -1'
                }}>
                  <div className="game-preview-label">
                    📎 Dokumentumok ({documents.length})
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '10px'
                  }}>
                    {documents.map(doc => (
                      <div key={doc.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: 'var(--game-cream)',
                        border: 'var(--border-thin) solid var(--game-brown)',
                        borderRadius: 'var(--radius-small)'
                      }}>
                        <div style={{ fontSize: '24px' }}>📄</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 600,
                            color: 'var(--game-brown)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {doc.original_filename}
                          </div>
                          {doc.description && (
                            <div style={{
                              fontSize: '13px',
                              color: 'var(--game-brown-medium)'
                            }}>
                              {doc.description}
                            </div>
                          )}
                        </div>
                        <button
                          className="game-btn game-btn-small game-btn-secondary"
                          onClick={() => handleDownload(doc)}
                        >
                          ⬇️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer - JAVÍTVA: sticky pozíció */}
          <div style={{
            background: 'var(--game-cream-light)',
            borderTop: 'var(--border-medium) solid var(--game-brown)',
            padding: '15px',
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            borderBottomLeftRadius: 'var(--radius-large)',
            borderBottomRightRadius: 'var(--radius-large)',
            flexShrink: 0,
            marginTop: 'auto'  // JAVÍTVA: mindig alul legyen a flexbox-ban
          }}>
            <button 
              className="game-btn game-btn-primary"
              onClick={onEdit}
              style={{
                minWidth: '130px'
              }}
            >
              ✏️ Szerkesztés
            </button>
            <button 
              className="game-btn game-btn-secondary"
              onClick={onClose}
              style={{
                minWidth: '100px'
              }}
            >
              Bezár
            </button>
          </div>
        </div>
      </div>

      {/* Full Size Image Modal */}
      {showFullImage && imageUrl && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'pointer'
          }}
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={imageUrl}
            alt={item.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 'var(--radius-medium)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)'
            }}
          />
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'var(--game-red)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* CSS */}
      <style>{`
        .game-preview-field {
          padding: 15px;
          background: var(--game-cream-light);
          border: var(--border-thin) solid var(--game-brown);
          borderRadius: var(--radius-small);
        }

        .game-preview-label {
          font-family: var(--font-text);
          font-size: 14px;
          font-weight: 600;
          color: var(--game-brown-medium);
          margin-bottom: 8px;
        }

        .game-preview-value {
          font-family: var(--font-text);
          font-size: 16px;
          color: var(--game-brown);
          font-weight: 500;
        }
      `}</style>
    </>
  );
}

export default ItemPreviewGameUI;
