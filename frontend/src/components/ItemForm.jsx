/**
 * ItemForm komponens - Tárgy hozzáadása/szerkesztése FRISSÍTVE
 * Frontend Developer: Sarah Kim
 * 
 * Új funkciók:
 * - User selector
 * - Location selector
 * - Quantity & min_quantity
 * - QR code generálás
 * - Dokumentum feltöltés
 */

import React, { useState, useEffect, useRef } from 'react';
import MultiImageUpload from './MultiImageUpload';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import UserSelector from './UserSelector';
import LocationSelector from './LocationSelector';
import api from '../services/api';

const ItemForm = ({ item, categories, onSubmit, onCancel }) => {
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
  const [gallery, setGallery] = useState([]);
  const galleryRef = useRef([]);  // JAVÍTVA: galleryRef definiálása

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
      // Képek betöltése
      const newGallery = item.images || (item.image_filename ? [{ filename: item.image_filename, original_filename: item.image_filename, orientation: null }] : []);
      setGallery(newGallery);
      galleryRef.current = newGallery;  // JAVÍTVA: ref is frissítése
    } else {
      setGallery([]);
      galleryRef.current = [];  // JAVÍTVA: ref is törlése
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGalleryChange = (images) => {
    console.log('🖼️🖼️🖼️ ItemForm (retro) handleGalleryChange hívva!', {
      imagesCount: images?.length || 0,
      images: images
    });
    const newGallery = images || [];
    setGallery(newGallery);
    galleryRef.current = newGallery;  // JAVÍTVA: ref is frissítése
    // Az első kép marad fő képnek is a visszafele kompatibilitás miatt
    setFormData(prev => ({
      ...prev,
      image_filename: newGallery?.[0]?.filename || null
    }));
    console.log('✅ Gallery state frissítve (retro):', newGallery.length, 'képpel');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validáció
    if (!formData.name || !formData.category) {
      alert('Név és kategória megadása kötelező!');
      return;
    }

    // Numerikus mezők konvertálása
    // JAVÍTVA: Használjuk a galleryRef-et, hogy biztosan a legfrissebb gallery-t kapjuk
    const currentGallery = galleryRef.current.length > 0 ? galleryRef.current : gallery;
    
    console.log('📤 handleSubmit (retro) - gallery state:', {
      galleryRefCount: galleryRef.current.length,
      galleryStateCount: gallery.length,
      currentGalleryCount: currentGallery.length
    });
    
    const submitData = {
      ...formData,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      quantity: parseInt(formData.quantity) || 1,
      min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : null,
      user_id: formData.user_id || null,
      location_id: formData.location_id || null,
      images: currentGallery.map(img => ({
        filename: img.filename,
        original_filename: img.original_filename || img.filename,
        orientation: img.orientation || null
      }))
    };

    // JAVÍTVA: Debug log
    console.log('📤📤📤 ItemForm (retro) submit data:', {
      ...submitData,
      images_count: submitData.images.length,
      gallery_count: gallery?.length || 0,
      gallery: gallery
    });

    onSubmit(submitData);
  };

  const handleGenerateQR = async (size = 'medium') => {
    if (!item || !item.id) {
      alert('Először mentsd el a tárgyat, aztán generálhatsz QR kódot!');
      return;
    }

    try {
      setGeneratingQR(true);
      const result = await api.generateQR(item.id, size);
      setQrCode(result.qr_code_id);
      alert(`✅ QR kód generálva: ${result.qr_code_id}`);
    } catch (error) {
      console.error('QR generálási hiba:', error);
      alert('❌ Hiba történt a QR kód generálásakor!');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDownloadQR = (size) => {
    if (!item || !item.id) return;
    const url = api.getQRDownloadUrl(item.id, size);
    window.open(url, '_blank');
  };

  const isLowStock = formData.min_quantity && formData.quantity <= formData.min_quantity;

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <div className="form-content">
        
        {/* Alapadatok */}
        <div className="form-section">
          <h3>📋 Alapadatok</h3>

          <div className="form-group">
            <label className="form-label required">Név</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="pl. Samsung TV 55''"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Kategória</label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Válassz kategóriát...</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Leírás</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Részletes leírás..."
              rows="3"
            />
          </div>
        </div>

        {/* Mennyiség & Low Stock */}
        <div className="form-section">
          <h3>📦 Mennyiség</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Jelenlegi mennyiség</label>
              <input
                type="number"
                name="quantity"
                className="form-input"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum készlet (alert)</label>
              <input
                type="number"
                name="min_quantity"
                className="form-input"
                value={formData.min_quantity || ''}
                onChange={handleChange}
                min="0"
                placeholder="Opcionális"
              />
            </div>
          </div>

          {isLowStock && (
            <div className="low-stock-warning">
              ⚠️ Alacsony készlet! ({formData.quantity} / {formData.min_quantity})
            </div>
          )}
        </div>

        {/* Tulajdonos */}
        <div className="form-section">
          <h3>👤 Tulajdonos</h3>
          <UserSelector
            selectedUserId={formData.user_id}
            onUserChange={(userId) => setFormData(prev => ({ ...prev, user_id: userId }))}
          />
        </div>

        {/* Helyszín */}
        <div className="form-section">
          <h3>📍 Helyszín</h3>
          <LocationSelector
            selectedLocationId={formData.location_id}
            onLocationChange={(locationId) => setFormData(prev => ({ ...prev, location_id: locationId }))}
          />
        </div>

        {/* Vásárlási adatok */}
        <div className="form-section">
          <h3>💰 Vásárlási adatok</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Vásárlási ár</label>
              <input
                type="number"
                name="purchase_price"
                className="form-input"
                value={formData.purchase_price}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vásárlás dátuma</label>
              <input
                type="date"
                name="purchase_date"
                className="form-input"
                value={formData.purchase_date}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Jegyzetek */}
        <div className="form-section">
          <h3>📝 Jegyzetek</h3>
          <div className="form-group">
            <textarea
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="További információk, garancia adatok, stb..."
              rows="2"
            />
          </div>
        </div>

        {/* Kép feltöltés */}
        <div className="form-section">
          <h3>📸 Képek</h3>
          <MultiImageUpload
            initialImages={gallery}
            onChange={handleGalleryChange}
            itemId={item?.id}
          />
        </div>

        {/* QR Kód (csak meglévő tétel esetén) */}
        {item && item.id && (
          <div className="form-section">
            <h3>🔲 QR Kód</h3>
            
            {qrCode ? (
              <div className="qr-section">
                <div className="qr-info">
                  <span className="qr-code-id">📱 {qrCode}</span>
                  <span className="qr-status">✅ Aktív</span>
                </div>
                
                <div className="qr-actions">
                  <button
                    type="button"
                    className="btn btn-qr"
                    onClick={() => handleDownloadQR('small')}
                  >
                    📥 Kis címke (3x3cm)
                  </button>
                  <button
                    type="button"
                    className="btn btn-qr"
                    onClick={() => handleDownloadQR('medium')}
                  >
                    📥 Közepes (5x5cm)
                  </button>
                  <button
                    type="button"
                    className="btn btn-qr"
                    onClick={() => handleDownloadQR('large')}
                  >
                    📥 Nagy (8x8cm)
                  </button>
                </div>
              </div>
            ) : (
              <div className="qr-generate">
                <p>Még nincs QR kód ehhez a tárgyhoz.</p>
                <div className="qr-generate-buttons">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleGenerateQR('small')}
                    disabled={generatingQR}
                  >
                    {generatingQR ? '⏳ Generálás...' : '🔲 Kis QR (3x3cm)'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleGenerateQR('medium')}
                    disabled={generatingQR}
                  >
                    {generatingQR ? '⏳ Generálás...' : '🔲 Közepes (5x5cm)'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
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
            <div className="form-section">
              <h3>📎 Dokumentumok</h3>
              <DocumentUpload 
                itemId={item.id}
                onDocumentUploaded={() => {
                  // Refresh document list
                }}
              />
            </div>
            
            <div className="form-section">
              <DocumentList itemId={item.id} />
            </div>
          </>
        )}
      </div>

      {/* Form akciók */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Mégse
        </button>
        <button type="submit" className="btn btn-primary">
          {item ? '💾 Mentés' : '➕ Hozzáadás'}
        </button>
      </div>

      <style jsx>{`
        .item-form {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .form-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }

        .form-label.required::after {
          content: ' *';
          color: #e74c3c;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-textarea {
          resize: vertical;
        }

        .low-stock-warning {
          padding: 10px;
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 4px;
          color: #856404;
          font-weight: 500;
          text-align: center;
        }

        .qr-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .qr-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .qr-code-id {
          font-family: monospace;
          font-weight: bold;
          color: #333;
        }

        .qr-status {
          color: #2ecc71;
          font-weight: 500;
        }

        .qr-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .qr-generate {
          text-align: center;
          padding: 20px;
        }

        .qr-generate p {
          color: #666;
          margin-bottom: 15px;
        }

        .qr-generate-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2980b9;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-qr {
          background: #9b59b6;
          color: white;
          flex: 1;
          min-width: 150px;
        }

        .btn-qr:hover {
          background: #8e44ad;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 20px 0;
          position: sticky;
          bottom: 0;
          background: white;
          border-top: 2px solid #e0e0e0;
          margin-top: 20px;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .qr-actions {
            flex-direction: column;
          }

          .btn-qr {
            width: 100%;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </form>
  );
};

export default ItemForm;
