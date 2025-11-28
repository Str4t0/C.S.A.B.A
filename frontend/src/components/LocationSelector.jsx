/**
 * LocationSelector - FIXED VERSION
 * Undefined array ellenőrzéssel
 */

import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../services/api';  // JAVÍTVA: locationsAPI import

const LOCATION_ICONS = [
  '🏠', '🏢', '🏪', '🛋️', '🛏️', '🍳',
  '🚪', '📦', '🗄️', '🧰', '🎒', '👔',
  '📚', '🎮', '🔧', '🎨'
];

const LocationSelector = ({ selectedLocationId, onLocationChange, showCreateNew = true }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: null,
    icon: LOCATION_ICONS[0]
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationsAPI.getAll();  // JAVÍTVA: locationsAPI használata
      setLocations(data || []); // JAVÍTVA: null check
    } catch (error) {
      console.error('Location betöltési hiba:', error);
      setLocations([]); // JAVÍTVA: hiba esetén üres array
    } finally {
      setLoading(false);
    }
  };

  const buildTree = () => {
    if (!Array.isArray(locations) || locations.length === 0) {
      return []; // JAVÍTVA: üres array ha nincs locations
    }

    const tree = [];
    const roots = locations.filter(loc => !loc.parent_id);

    const addChildren = (parent, level = 0) => {
      tree.push({ ...parent, level });
      const children = locations.filter(loc => loc.parent_id === parent.id);
      children.forEach(child => addChildren(child, level + 1));
    };

    roots.forEach(root => addChildren(root));
    return tree;
  };

  const handleSubmit = async () => {
    try {
      await locationsAPI.create(formData);  // JAVÍTVA: locationsAPI használata
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        parent_id: null,
        icon: LOCATION_ICONS[0]
      });
      loadLocations();
    } catch (error) {
      console.error('Location létrehozási hiba:', error);
      alert('Hiba történt a helyszín létrehozása során!');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Betöltés...</div>;
  }

  const treeLocations = buildTree();

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

        {/* Location lista - JAVÍTVA: ellenőrizzük hogy van-e */}
        {treeLocations.length > 0 ? (
          treeLocations.map(location => (
            <div
              key={location.id}
              className={`location-item ${selectedLocationId === location.id ? 'selected' : ''}`}
              style={{ paddingLeft: `${20 + location.level * 20}px` }}
              onClick={() => onLocationChange(location.id)}
            >
              {location.level > 0 && <span className="tree-indicator">└─ </span>}
              <span className="location-icon">{location.icon || '📍'}</span>
              <span className="location-name">{location.name}</span>
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
            <input
              type="text"
              placeholder="Név *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <textarea
              placeholder="Leírás (opcionális)"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />

            <select
              value={formData.parent_id || ''}
              onChange={(e) => setFormData({...formData, parent_id: e.target.value ? parseInt(e.target.value) : null})}
            >
              <option value="">Nincs szülő (gyökér szint)</option>
              {Array.isArray(locations) && locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.full_path || loc.name}
                </option>
              ))}
            </select>

            <div className="icon-picker">
              <label>Ikon:</label>
              <div className="icon-grid">
                {LOCATION_ICONS.map(icon => (
                  <div
                    key={icon}
                    className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, icon})}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

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

        .location-name {
          flex: 1;
          font-weight: 500;
        }

        .tree-indicator {
          color: #999;
          font-family: monospace;
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

        .location-form input,
        .location-form textarea,
        .location-form select {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        .icon-picker {
          margin: 15px 0;
        }

        .icon-picker label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .icon-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 8px;
        }

        .icon-option {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          border: 2px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-option:hover {
          transform: scale(1.1);
          border-color: #007bff;
        }

        .icon-option.selected {
          border-color: #007bff;
          background: #e7f3ff;
          box-shadow: 0 0 0 2px #007bff;
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
