/**
 * ImageGallery komponens - Többképes gallery swipe-pal
 * Frontend Developer: AI Assistant
 * 
 * Funkciók:
 * - Több kép megjelenítése
 * - Swipe balra/jobbra
 * - Kép forgatás
 * - Full screen view
 * - Elsődleges kép kiválasztása
 */

import React, { useState, useRef } from 'react';
import { imagesAPI } from '../services/api';

function ImageGallery({ images, onRotate, onSetPrimary, onDelete, readOnly = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  
  const minSwipeDistance = 50;

  // Ha nincs kép
  if (!images || images.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'var(--game-cream-light)',
        border: 'var(--border-medium) solid var(--game-brown)',
        borderRadius: 'var(--radius-medium)',
        color: 'var(--game-brown-medium)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
        <p>Nincs kép</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const imageUrl = imagesAPI.getImageUrl(currentImage.filename);

  // Swipe handlers
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
    
    // Horizontal swipe
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (distanceX > minSwipeDistance) {
        // Left swipe - következő kép
        handleNext();
      } else if (distanceX < -minSwipeDistance) {
        // Right swipe - előző kép
        handlePrev();
      }
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleRotate = () => {
    if (onRotate) {
      const newRotation = (currentImage.rotation + 90) % 360;
      onRotate(currentImage.id, newRotation);
    }
  };

  return (
    <>
      {/* Gallery Container */}
      <div style={{
        position: 'relative',
        background: 'var(--game-cream-light)',
        border: 'var(--border-thick) solid var(--game-brown)',
        borderRadius: 'var(--radius-medium)',
        overflow: 'hidden'
      }}>
        {/* Main Image */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            cursor: 'pointer'
          }}
          onClick={() => setShowFullScreen(true)}
        >
          <img
            src={imageUrl}
            alt={currentImage.original_filename}
            style={{
              maxWidth: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
              transform: `rotate(${currentImage.rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          />

          {/* Primary Badge */}
          {currentImage.is_primary && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'var(--game-blue)',
              color: 'white',
              padding: '5px 12px',
              borderRadius: 'var(--radius-small)',
              fontSize: '12px',
              fontWeight: 'bold',
              border: 'var(--border-thin) solid var(--game-blue-dark)'
            }}>
              ⭐ ELSŐDLEGES
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '5px 12px',
              borderRadius: 'var(--radius-small)',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                →
              </button>
            </>
          )}

          {/* Click to Enlarge */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '5px 12px',
            borderRadius: 'var(--radius-small)',
            fontSize: '12px'
          }}>
            🔍 Kattints a nagyításhoz
          </div>
        </div>

        {/* Controls */}
        {!readOnly && (
          <div style={{
            display: 'flex',
            gap: '10px',
            padding: '15px',
            borderTop: 'var(--border-medium) solid var(--game-brown)',
            background: 'var(--game-cream)'
          }}>
            <button
              className="game-btn game-btn-small"
              onClick={handleRotate}
              title="Forgatás 90°"
            >
              🔄 Forgatás
            </button>

            {!currentImage.is_primary && onSetPrimary && (
              <button
                className="game-btn game-btn-small"
                onClick={() => onSetPrimary(currentImage.id)}
                style={{
                  background: 'var(--game-blue)',
                  borderColor: 'var(--game-blue-dark)'
                }}
              >
                ⭐ Elsődleges
              </button>
            )}

            {images.length > 1 && onDelete && (
              <button
                className="game-btn game-btn-small game-btn-danger"
                onClick={() => {
                  if (window.confirm('Biztosan törölni szeretnéd ezt a képet?')) {
                    onDelete(currentImage.id);
                    // Indexet állítsuk vissza ha szükséges
                    if (currentIndex >= images.length - 1) {
                      setCurrentIndex(Math.max(0, currentIndex - 1));
                    }
                  }
                }}
              >
                🗑️ Törlés
              </button>
            )}
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '10px',
            padding: '15px',
            overflowX: 'auto',
            borderTop: 'var(--border-medium) solid var(--game-brown)',
            background: 'var(--game-cream-light)'
          }}>
            {images.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  width: '80px',
                  height: '80px',
                  border: idx === currentIndex 
                    ? 'var(--border-thick) solid var(--game-orange)' 
                    : 'var(--border-medium) solid var(--game-brown)',
                  borderRadius: 'var(--radius-small)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: idx === currentIndex ? 1 : 0.6,
                  transition: 'all 0.2s'
                }}
              >
                <img
                  src={imagesAPI.getImageUrl(img.filename)}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `rotate(${img.rotation}deg)`
                  }}
                />
                {img.is_primary && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    fontSize: '14px'
                  }}>
                    ⭐
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {showFullScreen && (
        <div
          onClick={() => setShowFullScreen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 10002,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'pointer',
            overflow: 'hidden'  // JAVÍTVA: overflow hidden hogy ne csússzon el
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={imageUrl}
            alt={currentImage.original_filename || currentImage.filename}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `rotate(${currentImage.rotation || 0}deg)`,
              borderRadius: 'var(--radius-medium)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none'  // JAVÍTVA: ne blokkolja a gombokat
            }}
          />

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullScreen(false);
            }}
            style={{
              position: 'fixed',  // JAVÍTVA: fixed helyett absolute
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
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
              zIndex: 10003  // JAVÍTVA: magasabb z-index
            }}
          >
            ✕
          </button>

          {/* Image Counter Full Screen */}
          {images.length > 1 && (
            <div style={{
              position: 'fixed',  // JAVÍTVA: fixed helyett absolute
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 'var(--radius-medium)',
              fontSize: '18px',
              fontWeight: 'bold',
              zIndex: 10003  // JAVÍTVA: magasabb z-index
            }}>
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Navigation in Full Screen */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  fontSize: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  fontSize: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                →
              </button>
            </>
          )}

          {/* Swipe Hint */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 'var(--radius-medium)',
              fontSize: '14px'
            }}>
              👈 Swipe balra/jobbra 👉
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ImageGallery;
