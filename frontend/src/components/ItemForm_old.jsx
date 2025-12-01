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

import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import UserSelector from './UserSelector';
import LocationSelector from './LocationSelector';
// ✅ JAVÍTVA: default import → named imports
import { imagesAPI, itemsAPI, usersAPI, locationsAPI, documentsAPI } from '../services/api';

// QR API helper (mivel nincs a services/api.js-ben)
const qrAPI = {
  generateQR: async (itemId, size = 'medium') => {
    const response = await fetch(`http://localhost:8000/api/qr/generate/${itemId}?size=${size}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('QR generálás sikertelen');
    return response.json();
  },
  getQRDownloadUrl: (itemId, size = 'medium') => {
    return `http://localhost:8000/api/qr/download/${itemId}/${size}`;
  }
};

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

  // Form kitöltése szerkesztéskor
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
      alert('Először mentsd el a tárgyat, aztán generálhatsz QR kódot!');
      return;
    }

    try {
      setGeneratingQR(true);
      const result = await qrAPI.generateQR(item.id, size);
      setQrCode(result.qr_code);
      alert(`✅ QR kód generálva: ${result.qr_code}`);
    } catch (error) {
      console.error('QR generálási hiba:', error);
      alert('❌ Hiba történt a QR kód generálásakor!');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDownloadQR = (size) => {
    if (!item || !item.id) return;
    const url = qrAPI.getQRDownloadUrl(item.id, size);
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
                <option key={cat.id} value={cat.name}>
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
              placeholder="Rövid leírás a tárgyról..."
              rows="3"
            />
          </div>
        </div>

        {/* Mennyiség */}
        <div className="form-section">
          <h3>📊 Mennyiség</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Jelenlegi mennyiség</label>
              <input
                type="number"
                name="quantity"
                className="form-input"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum készlet</label>
              <input
                type="number"
                name="min_quantity"
                className="form-input"
                value={formData.min_quantity || ''}
                onChange={handleChange}
                min="0"
                placeholder="Riasztási küszöb"
              />
              {isLowStock && (
                <span className="form-help error">⚠️ Alacsony készlet!</span>
              )}
            </div>
          </div>
        </div>

        {/* Vásárlási adatok */}
        <div className="form-section">
          <h3>💰 Vásárlási adatok</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Vásárlási ár</label>
              <div className="input-group">
                <input
                  type="number"
                  name="purchase_price"
                  className="form-input"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="0"
                />
                <span className="input-addon">Ft</span>
              </div>
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

        {/* Tulajdonos és helyszín */}
        <div className="form-section">
          <h3>👤 Tulajdonos & Helyszín</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tulajdonos</label>
              <UserSelector
                value={formData.user_id}
                onChange={(userId) => setFormData(prev => ({ ...prev, user_id: userId }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Helyszín</label>
              <LocationSelector
                value={formData.location_id}
                onChange={(locationId) => setFormData(prev => ({ ...prev, location_id: locationId }))}
              />
            </div>
          </div>
        </div>

        {/* Kép feltöltés */}
        <div className="form-section">
          <h3>📷 Kép</h3>
          <FileUpload
            itemId={item?.id}
            currentImage={formData.image_filename}
            onImageUploaded={handleImageUploaded}
          />
        </div>

        {/* QR kód */}
        {item && item.id && (
          <div className="form-section">
            <h3>🔲 QR Kód</h3>
            
            {!qrCode ? (
              <div className="qr-generate">
                <p className="form-help">Generálj QR kódot a tárgyhoz a gyors azonosításhoz.</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleGenerateQR('medium')}
                  disabled={generatingQR}
                >
                  {generatingQR ? '⏳ Generálás...' : '🔲 QR Kód Generálás'}
                </button>
              </div>
            ) : (
              <div className="qr-download">
                <p className="form-help success">✅ QR kód: <strong>{qrCode}</strong></p>
                <div className="qr-download-buttons">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => handleDownloadQR('small')}
                  >
                    📥 Kicsi (3cm)
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => handleDownloadQR('medium')}
                  >
                    📥 Közepes (5cm)
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => handleDownloadQR('large')}
                  >
                    📥 Nagy (8cm)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Jegyzetek */}
        <div className="form-section">
          <h3>📝 Jegyzetek</h3>
          <textarea
            name="notes"
            className="form-textarea"
            value={formData.notes}
            onChange={handleChange}
            placeholder="További megjegyzések, jegyz etek..."
            rows="4"
          />
        </div>

        {/* Dokumentumok */}
        {item && item.id && (
          <div className="form-section">
            <h3>📄 Dokumentumok</h3>
            <p className="form-help">Tölts fel garanciát, számlát vagy egyéb dokumentumokat.</p>
            <DocumentUpload itemId={item.id} />
            <DocumentList itemId={item.id} />
          </div>
        )}
      </div>

      {/* Gombok */}
      <div className="form-actions">
        <button type="button" className="btn btn-cancel" onClick={onCancel}>
          Mégse
        </button>
        <button type="submit" className="btn btn-primary">
          {item ? '💾 Mentés' : '➕ Hozzáadás'}
        </button>
      </div>
    </form>
  );
};

export default ItemForm;
