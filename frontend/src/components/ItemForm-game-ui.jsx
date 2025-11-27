/**
 * ItemForm Game UI - Tárgy hozzáadása/szerkesztése Game UI stílussal
 * Frontend Developer: Sarah Kim
 * Game UI Design: Claude AI
 * 
 * Funkciók:
 * - User selector
 * - Location selector
 * - Quantity & min_quantity
 * - QR code generálás (3 méret)
 * - Dokumentum feltöltés
 * - Game UI design
 */

import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import DocumentUploadGameUI from './DocumentUpload-game-ui';
import DocumentListGameUI from './DocumentList-game-ui';
import UserSelector from './UserSelector';
import LocationSelector from './LocationSelector';
import { qrAPI } from '../services/api';

const ItemFormGameUI = ({ item, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    purchase_price: '',
    purchase_date: '',
    notes: '',
    image_filename: null,
    user_id: null,
    location_id: null,
    quantity: 1,
    min_quantity: null
  });

  const [qrCode, setQrCode] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [documentRefreshKey, setDocumentRefreshKey] = useState(0);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        description: item.description || '',
        purchase_price: item.purchase_price || '',
        purchase_date: item.purchase_date || '',
        notes: item.notes || '',
        image_filename: item.image_filename || null,
        user_id: item.user_id || null,
        location_id: item.location_id || null,
        quantity: item.quantity || 1,
        min_quantity: item.min_quantity || null
      });
      
      // QR kód betöltése ha van
      if (item.qr_code) {
        setQrCode(item.qr_code);
      }
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUploaded = (filename) => {
    setFormData(prev => ({
      ...prev,
      image_filename: filename
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validáció
    if (!formData.name || !formData.category) {
      alert('Név és kategória megadása kötelező!');
      return;
    }

    // Numerikus mezők konvertálása
    const submitData = {
      ...formData,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      quantity: parseInt(formData.quantity) || 1,
      min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : null,
      user_id: formData.user_id || null,
      location_id: formData.location_id || null
    };

    onSubmit(submitData);
  };

  const handleGenerateQR = async (size = 'medium') => {
    if (!item || !item.id) {
      alert('Először mentsd el a tárgyat, majd generálhatsz QR kódot!');
      return;
    }

    setGeneratingQR(true);
    try {
      const response = await qrAPI.generate(item.id, size);
      setQrCode(response.qr_code);
      alert('✅ QR kód sikeresen generálva!');
      
      // Automatikus letöltés
      handleDownloadQR(size);
    } catch (error) {
      console.error('QR generálási hiba:', error);
      alert('Hiba történt a QR kód generálása során!');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDownloadQR = (size) => {
    if (!item || !item.id) return;
    
    const downloadUrl = qrAPI.getDownloadUrl(item.id, size);
    window.open(downloadUrl, '_blank');
  };

  // Low stock ellenőrzés
  const isLowStock = formData.min_quantity && 
                     formData.quantity <= formData.min_quantity;

  return (
    <form onSubmit={handleSubmit} style={{ 
      maxWidth: '800px', 
      margin: '0 auto',
      maxHeight: '70vh',
      overflowY: 'auto',
      padding: '0 10px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Alapadatok */}
        <div style={{
          background: 'var(--game-cream-light)',
          border: 'var(--border-medium) solid var(--game-brown)',
          borderRadius: 'var(--radius-medium)',
          padding: '20px'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '20px',
            color: 'var(--game-brown)',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: 'var(--border-thin) solid var(--game-brown)'
          }}>📝 Alapadatok</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: 'var(--game-brown)',
              fontFamily: 'var(--font-text)'
            }}>
              Név <span style={{ color: 'var(--game-red)' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              className="game-search-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tárgy neve..."
              required
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: 'var(--game-brown)',
              fontFamily: 'var(--font-text)'
            }}>
              Kategória <span style={{ color: 'var(--game-red)' }}>*</span>
            </label>
            <select
              name="category"
              className="game-search-input"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ marginBottom: 0 }}
            >
              <option value="">Válassz kategóriát...</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: 'var(--game-brown)',
              fontFamily: 'var(--font-text)'
            }}>Leírás</label>
            <textarea
              name="description"
              className="game-search-input"
              value={formData.description}
              onChange={handleChange}
              placeholder="Részletes leírás..."
              rows="3"
              style={{ resize: 'vertical', marginBottom: 0 }}
            />
          </div>
        </div>

        {/* Mennyiség & Low Stock */}
        <div style={{
          background: 'var(--game-cream-light)',
          border: 'var(--border-medium) solid var(--game-brown)',
          borderRadius: 'var(--radius-medium)',
          padding: '20px'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '20px',
            color: 'var(--game-brown)',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: 'var(--border-thin) solid var(--game-brown)'
          }}>📦 Mennyiség</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: 'var(--game-brown)',
                fontFamily: 'var(--font-text)'
              }}>Jelenlegi mennyiség</label>
              <input
                type="number"
                name="quantity"
                className="game-search-input"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                style={{ marginBottom: 0 }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: 'var(--game-brown)',
                fontFamily: 'var(--font-text)'
              }}>Minimum készlet (alert)</label>
              <input
                type="number"
                name="min_quantity"
                className="game-search-input"
                value={formData.min_quantity || ''}
                onChange={handleChange}
                min="0"
                placeholder="Opcionális"
                style={{ marginBottom: 0 }}
              />
            </div>
          </div>

          {isLowStock && (
            <div className="game-alert game-alert-warning" style={{ marginBottom: 0 }}>
              <div className="game-alert-content">
                ⚠️ Alacsony készlet! ({formData.quantity} / {formData.min_quantity})
              </div>
            </div>
          )}
        </div>

        {/* Tulajdonos */}
        <div style={{
          background: 'var(--game-cream-light)',
          border: 'var(--border-medium) solid var(--game-brown)',
          borderRadius: 'var(--radius-medium)',
          padding: '20px'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '20px',
            color: 'var(--game-brown)',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: 'var(--border-thin) solid var(--game-brown)'
          }}>👤 Tulajdonos</h3>
          <UserSelector
            selectedUserId={formData.user_id}
            onUserChange={(userId) => setFormData(prev => ({ ...prev, user_id: userId }))}
          />
        </div>

        {/* Helyszín */}
        <div style={{
          background: 'var(--game-cream-light)',
          border: 'var(--border-medium) solid var(--game-brown)',
          borderRadius: 'var(--radius-medium)',
          padding: '20px'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '20px',
            color: 'var(--game-brown)',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: 'var(--border-thin) solid var(--game-brown)'
          }}>📍 Helyszín</h3>
          <LocationSelector
            selectedLocationId={formData.location_id}
            onLocationChange={(locationId) => setFormData(prev => ({ ...prev, location_id: locationId }))}
          />
        </div>

        {/* Vásárlási adatok */}
        <div style={{
          background: 'var(--game-cream-light)',
          border: 'var(--border-medium) solid var(--game-brown)',
          borderRadius: 'var(--radius-medium)',
          padding: '20px'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '20px',
            color: 'var(--game-brown)',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: 'var(--border-thin) solid var(--game-brown)'
          }}>💰 Vásárlási adatok</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: 'var(--game-brown)',
                fontFamily: 'var(--font-text)'
              }}>Vásárlási ár</label>
              <input
                type="number"
                name="purchase_price"
                className="game-search-input"
                value={formData.purchase_price}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                min="0"
                style={{ marginBottom: 0 }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: 'var(--game-brown)',
                fontFamily: 'var(--font-text)'
              }}>Vásárlás dátuma</label>
              <input
                type="date"
                name="purchase_date"
                className="game-search-input"
                value={formData.purchase_date}
                onChange={handleChange}
                style={{ marginBottom: 0 }}
              />
            </div>
          </div>
        </div>

        {/* Jegyzetek */}
        <div style={{
          background: 'var(--game-cream-light)',
          border: 'var(--border-medium) solid var(--game-brown)',
          borderRadius: 'var(--radius-medium)',
          padding: '20px'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '20px',
            color: 'var(--game-brown)',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: 'var(--border-thin) solid var(--game-brown)'
          }}>📝 Jegyzetek</h3>
          <textarea
            name="notes"
            className="game-search-input"
            value={formData.notes}
            onChange={handleChange}
            placeholder="További információk, garancia adatok, stb..."
            rows="2"
            style={{ resize: 'vertical', marginBottom: 0 }}
          />
        </div>

        {/* Kép feltöltés */}
        <div style={{
          background: 'var(--game-cream-light)',
          border: 'var(--border-medium) solid var(--game-brown)',
          borderRadius: 'var(--radius-medium)',
          padding: '20px'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-game)',
            fontSize: '20px',
            color: 'var(--game-brown)',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: 'var(--border-thin) solid var(--game-brown)'
          }}>📸 Kép</h3>
          <FileUpload 
            onImageUploaded={handleImageUploaded}
            currentImage={formData.image_filename}
          />
        </div>

        {/* QR Kód (csak meglévő tétel esetén) */}
        {item && item.id && (
          <div style={{
            background: 'var(--game-cream-light)',
            border: 'var(--border-medium) solid var(--game-brown)',
            borderRadius: 'var(--radius-medium)',
            padding: '20px'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-game)',
              fontSize: '20px',
              color: 'var(--game-brown)',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: 'var(--border-thin) solid var(--game-brown)'
            }}>🔲 QR Kód</h3>
            
            {qrCode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--game-cream)',
                  border: 'var(--border-thin) solid var(--game-brown)',
                  borderRadius: 'var(--radius-small)'
                }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: 'var(--game-brown)'
                  }}>📱 {qrCode}</span>
                  <span style={{
                    color: 'var(--status-ok)',
                    fontWeight: '600',
                    fontFamily: 'var(--font-text)'
                  }}>✅ Aktív</span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="game-btn game-btn-small"
                    onClick={() => handleDownloadQR('small')}
                    style={{ flex: 1, minWidth: '150px' }}
                  >
                    📥 Kis címke (3x3cm)
                  </button>
                  <button
                    type="button"
                    className="game-btn game-btn-small"
                    onClick={() => handleDownloadQR('medium')}
                    style={{ flex: 1, minWidth: '150px' }}
                  >
                    📥 Közepes (5x5cm)
                  </button>
                  <button
                    type="button"
                    className="game-btn game-btn-small"
                    onClick={() => handleDownloadQR('large')}
                    style={{ flex: 1, minWidth: '150px' }}
                  >
                    📥 Nagy (8x8cm)
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{
                  color: 'var(--game-brown-medium)',
                  marginBottom: '15px',
                  fontFamily: 'var(--font-text)'
                }}>
                  Még nincs QR kód ehhez a tárgyhoz.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="game-btn game-btn-primary game-btn-small"
                    onClick={() => handleGenerateQR('small')}
                    disabled={generatingQR}
                  >
                    {generatingQR ? '⏳ Generálás...' : '🔲 Kis QR (3x3cm)'}
                  </button>
                  <button
                    type="button"
                    className="game-btn game-btn-primary game-btn-small"
                    onClick={() => handleGenerateQR('medium')}
                    disabled={generatingQR}
                  >
                    {generatingQR ? '⏳ Generálás...' : '🔲 Közepes (5x5cm)'}
                  </button>
                  <button
                    type="button"
                    className="game-btn game-btn-primary game-btn-small"
                    onClick={() => handleGenerateQR('large')}
                    disabled={generatingQR}
                  >
                    {generatingQR ? '⏳ Generálás...' : '🔲 Nagy (8x8cm)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dokumentumok (csak meglévő tétel esetén) */}
        {item && item.id && (
          <>
            <div style={{
              background: 'var(--game-cream-light)',
              border: 'var(--border-medium) solid var(--game-brown)',
              borderRadius: 'var(--radius-medium)',
              padding: '20px'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-game)',
                fontSize: '20px',
                color: 'var(--game-brown)',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: 'var(--border-thin) solid var(--game-brown)'
              }}>📎 Dokumentumok feltöltése</h3>
              <DocumentUploadGameUI
                itemId={item.id}
                onDocumentUploaded={() => {
                  // Refresh document list so the new file can be downloaded immediately
                  setDocumentRefreshKey((key) => key + 1);
                }}
              />
            </div>

            <div style={{
              background: 'var(--game-cream-light)',
              border: 'var(--border-medium) solid var(--game-brown)',
              borderRadius: 'var(--radius-medium)',
              padding: '20px'
            }}>
              <DocumentListGameUI
                itemId={item.id}
                refreshTrigger={documentRefreshKey}
              />
            </div>
          </>
        )}
      </div>

      {/* Form akciók */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        paddingTop: '20px',
        position: 'sticky',
        bottom: 0,
        background: 'var(--game-cream)',
        borderTop: 'var(--border-medium) solid var(--game-brown)',
        marginTop: '20px',
        paddingBottom: '10px'
      }}>
        <button 
          type="button" 
          className="game-btn game-btn-secondary" 
          onClick={onCancel}
        >
          Mégse
        </button>
        <button 
          type="submit" 
          className="game-btn game-btn-primary"
        >
          {item ? '💾 Mentés' : '➕ Hozzáadás'}
        </button>
      </div>
    </form>
  );
};

export default ItemFormGameUI;
