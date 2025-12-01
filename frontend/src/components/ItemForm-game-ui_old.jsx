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
import { toast } from 'react-hot-toast';
import FileUpload from './FileUpload';
import DocumentUploadGameUI from './DocumentUpload-game-ui';
import DocumentListGameUI from './DocumentList-game-ui';
import UserSelector from './UserSelector';
import LocationSelector from './LocationSelector';
import { imagesAPI } from '../services/api';

const ItemFormGameUI = ({ item, categories, onSubmit, onCancel, onDirtyChange }) => {
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
    min_quantity: null,
    qr_code: null
  });

  const [qrCode, setQrCode] = useState(null);
  const [qrGenerating, setQrGenerating] = useState(null);
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
        min_quantity: item.min_quantity || null,
        qr_code: item.qr_code || null
      });

      // QR kód betöltése ha van
      setQrCode(item.qr_code || null);
    } else {
      setFormData({
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
        min_quantity: null,
        qr_code: null
      });
      setQrCode(null);
    }

    // reset dirty flag when switching items or opening a fresh form
    onDirtyChange?.(false);
  }, [item, onDirtyChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    onDirtyChange?.(true);
  };

  const handleImageUploaded = (filename) => {
    setFormData(prev => ({
      ...prev,
      image_filename: filename
    }));
    onDirtyChange?.(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validáció
    if (!formData.name || !formData.category) {
      alert('Név és kategória megadása kötelező!');
      return;
    }

    // Numerikus mezők konvertálása és üres stringek kiszűrése
    const normalizeNumber = (value, allowZero = true) => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return null;
        // vessző helyett pont támogatása
        value = trimmed.replace(',', '.');
      }
      const parsed = allowZero ? Number(value) : parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const submitData = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description?.trim() || null,
      purchase_price: normalizeNumber(formData.purchase_price, false),
      purchase_date: formData.purchase_date || null,
      quantity: normalizeNumber(formData.quantity) ?? 1,
      min_quantity: normalizeNumber(formData.min_quantity),
      user_id: normalizeNumber(formData.user_id),
      location_id: normalizeNumber(formData.location_id),
      notes: formData.notes?.trim() || null,
      image_filename: formData.image_filename || null
    };

    onDirtyChange?.(false);
    onSubmit(submitData);
  };

  const handleGenerateQR = async (size) => {
    const itemId = item?.id;

    if (!itemId) {
      toast.error('Először mentsd el a tárgyat!');
      return;
    }

    try {
      setQrGenerating(size);

      // 1. Generálás
      console.log(`🔲 QR generálás indítása: ${itemId}, ${size}`);
      const response = await api.post(`/qr/generate/${itemId}?size=${size}`);
      console.log('✅ QR generálás válasz:', response.data);

      // 2. State frissítés
      setFormData(prev => ({
        ...prev,
        qr_code: response.data.qr_code
      }));
      setQrCode(response.data.qr_code);

      toast.success(`${size.toUpperCase()} QR kód generálva!`);

      // 3. Kis delay majd letöltés
      await new Promise(resolve => setTimeout(resolve, 500));  // 500ms delay

      // 4. Letöltés - JAVÍTOTT URL
      const downloadUrl = `${api.defaults.baseURL}/qr/download/${itemId}/${size}`;
      console.log('📥 Letöltés URL:', downloadUrl);
      window.open(downloadUrl, '_blank');
      
    } catch (error) {
      console.error('❌ QR generálási hiba:', error);
      console.error('Hiba részletek:', error.response?.data);
      toast.error(error.response?.data?.detail || 'QR generálási hiba');
    } finally {
      setQrGenerating(null);
    }
  };

  const handleDownloadQR = (size) => {
    const itemId = item?.id;
    if (!itemId) {
      toast.error('Először mentsd el a tárgyat!');
      return;
    }

    // JAVÍTVA: teljes URL használata
    const downloadUrl = `${api.defaults.baseURL}/qr/download/${itemId}/${size}`;
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
            onUserChange={(userId) => {
              setFormData(prev => ({ ...prev, user_id: userId }));
              onDirtyChange?.(true);
            }}
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
            onLocationChange={(locationId) => {
              setFormData(prev => ({ ...prev, location_id: locationId }));
              onDirtyChange?.(true);
            }}
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
                
                {/* JAVÍTVA: Generálás gombok (újragenerálja + letölti) */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="game-btn game-btn-primary game-btn-small"
                    onClick={() => handleGenerateQR('small')}
                    disabled={!!qrGenerating}
                    style={{ flex: 1, minWidth: '150px' }}
                  >
                    {qrGenerating === 'small' ? '⏳ Generálás...' : '🔲 Kis címke (3x3cm)'}
                  </button>
                  <button
                    type="button"
                    className="game-btn game-btn-primary game-btn-small"
                    onClick={() => handleGenerateQR('medium')}
                    disabled={!!qrGenerating}
                    style={{ flex: 1, minWidth: '150px' }}
                  >
                    {qrGenerating === 'medium' ? '⏳ Generálás...' : '🔲 Közepes (5x5cm)'}
                  </button>
                  <button
                    type="button"
                    className="game-btn game-btn-primary game-btn-small"
                    onClick={() => handleGenerateQR('large')}
                    disabled={!!qrGenerating}
                    style={{ flex: 1, minWidth: '150px' }}
                  >
                    {qrGenerating === 'large' ? '⏳ Generálás...' : '🔲 Nagy (8x8cm)'}
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
                    disabled={!!qrGenerating}
                  >
                    {qrGenerating === 'small' ? '⏳ Generálás...' : '🔲 Kis QR (3x3cm)'}
                  </button>
                  <button
                    type="button"
                    className="game-btn game-btn-primary game-btn-small"
                    onClick={() => handleGenerateQR('medium')}
                    disabled={!!qrGenerating}
                  >
                    {qrGenerating === 'medium' ? '⏳ Generálás...' : '🔲 Közepes (5x5cm)'}
                  </button>
                  <button
                    type="button"
                    className="game-btn game-btn-primary game-btn-small"
                    onClick={() => handleGenerateQR('large')}
                    disabled={!!qrGenerating}
                  >
                    {qrGenerating === 'large' ? '⏳ Generálás...' : '🔲 Nagy (8x8cm)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dokumentumok */}
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
          }}>📎 Dokumentumok</h3>

          {item && item.id ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <DocumentUploadGameUI
                  itemId={item.id}
                  onDocumentUploaded={() => {
                    // Refresh document list so the new file can be downloaded immediately
                    setDocumentRefreshKey((key) => key + 1);
                  }}
                />
              </div>

              <DocumentListGameUI
                itemId={item.id}
                refreshTrigger={documentRefreshKey}
              />
            </>
          ) : (
            <div style={{
              background: 'var(--game-cream)',
              border: 'var(--border-thin) solid var(--game-brown)',
              borderRadius: 'var(--radius-small)',
              padding: '16px',
              fontFamily: 'var(--font-text)',
              color: 'var(--game-brown)'
            }}>
              <div style={{
                fontWeight: 700,
                marginBottom: '8px'
              }}>
                Mentés után tudsz dokumentumokat feltölteni és letölteni.
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '18px',
                color: 'var(--game-brown-medium)',
                lineHeight: 1.6
              }}>
                <li>Támogatott formátumok: PDF, Word, Excel, TXT, OpenDocument</li>
                <li>Maximális fájlméret: 20MB</li>
                <li>Garanciajegy, számla vagy kézikönyv is feltölthető</li>
              </ul>
            </div>
          )}
        </div>
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
