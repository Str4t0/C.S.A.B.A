/**
 * LocationSelector - UPDATED VERSION
 * Új helyszín mezők: country, postal_code, city, address
 */

import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../services/api';

const LocationSelector = ({ selectedLocationId, onLocationChange, showCreateNew = true }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    country: 'Magyarország',
    postal_code: '',
    city: '',
    address: ''
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationsAPI.getAll();
      setLocations(data || []);
    } catch (error) {
      console.error('Location betöltési hiba:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.city) {
      alert('A helység megadása kötelező!');
      return;
    }
    try {
      await locationsAPI.create(formData);
      setShowForm(false);
      setFormData({
        country: 'Magyarország',
        postal_code: '',
        city: '',
        address: ''
      });
      loadLocations();
    } catch (error) {
      console.error('Location létrehozási hiba:', error);
      alert('Hiba: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Betöltés...</div>;
  }

  return (
    <div className="location-selector">
      <div className="location-list">
        {/* Nincs megadva opció */}
        <div
          className={`location-item ${selectedLocationId === null ? 'selected' : ''}`}
          onClick={() => onLocationChange(null)}
        >
          <span className="location-icon">📍</span>
          <span className="location-name">Nincs megadva</span>
        </div>

        {/* Location lista */}
        {locations.length > 0 ? (
          locations.map(location => (
            <div
              key={location.id}
              className={`location-item ${selectedLocationId === location.id ? 'selected' : ''}`}
              onClick={() => onLocationChange(location.id)}
            >
              <span className="location-icon">📍</span>
              <div className="location-details">
                <span className="location-name">{location.city}{location.address && `, ${location.address}`}</span>
                <span className="location-meta">{location.country} {location.postal_code}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            Még nincs helyszín létrehozva
          </div>
        )}

        {/* Új location gomb */}
        {showCreateNew && !showForm && (
          <div 
            className="location-item new-location"
            onClick={() => setShowForm(true)}
          >
            <span className="location-icon">➕</span>
            <span className="location-name">Új helyszín</span>
          </div>
        )}
      </div>

      {/* Új location form */}
      {showForm && (
        <div className="location-form">
          <h4>Új helyszín</h4>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Ország"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
              <input
                type="text"
                placeholder="Irányítószám"
                value={formData.postal_code}
                onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
              />
            </div>
            <input
              type="text"
              placeholder="Helység (város) *"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Lakcím (utca, házszám)"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />

            <div className="form-actions">
              <button type="button" className="btn-primary" onClick={handleSubmit}>Létrehozás</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Mégse
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .location-selector {
          margin: 15px 0;
        }

        .location-list {
          max-height: 300px;
          overflow-y: auto;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
        }

        .location-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid #f0f0f0;
        }

        .location-item:last-child {
          border-bottom: none;
        }

        .location-item:hover {
          background: #f8f9fa;
        }

        .location-item.selected {
          background: #e7f3ff;
          border-left: 4px solid #007bff;
        }

        .location-item.new-location {
          border-top: 2px dashed #28a745;
          color: #28a745;
          font-weight: 600;
        }

        .location-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .location-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .location-name {
          font-weight: 500;
        }

        .location-meta {
          font-size: 12px;
          color: #666;
        }

        .location-form {
          margin-top: 20px;
          padding: 20px;
          border: 2px solid #007bff;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .location-form h4 {
          margin-top: 0;
          color: #007bff;
        }

        .location-form input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .form-actions button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }
      `}</style>
    </div>
  );
};

export default LocationSelector;
