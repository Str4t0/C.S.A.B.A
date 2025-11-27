/**
 * UserSelector - FIXED VERSION
 * Undefined array ellenőrzéssel
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AVATAR_COLORS = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
];

const UserSelector = ({ selectedUserId, onUserChange, showCreateNew = true }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    email: '',
    avatar_color: AVATAR_COLORS[0]
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data || []); // JAVÍTVA: null check
    } catch (error) {
      console.error('User betöltési hiba:', error);
      setUsers([]); // JAVÍTVA: hiba esetén üres array
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.createUser(formData);
      setShowForm(false);
      setFormData({
        username: '',
        display_name: '',
        email: '',
        avatar_color: AVATAR_COLORS[0]
      });
      loadUsers();
    } catch (error) {
      console.error('User létrehozási hiba:', error);
      alert('Hiba történt a felhasználó létrehozása során!');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Betöltés...</div>;
  }

  return (
    <div className="user-selector">
      <div className="user-grid">
        {/* Nincs tulajdonos opció */}
        <div
          className={`user-card ${selectedUserId === null ? 'selected' : ''}`}
          onClick={() => onUserChange(null)}
        >
          <div className="user-avatar" style={{ background: '#6c757d' }}>
            ?
          </div>
          <div className="user-name">Nincs</div>
        </div>

        {/* User lista - JAVÍTVA: ellenőrizzük hogy array-e */}
        {Array.isArray(users) && users.map(user => (
          <div
            key={user.id}
            className={`user-card ${selectedUserId === user.id ? 'selected' : ''}`}
            onClick={() => onUserChange(user.id)}
          >
            <div 
              className="user-avatar" 
              style={{ background: user.avatar_color || AVATAR_COLORS[0] }}
            >
              {getInitials(user.display_name)}
            </div>
            <div className="user-name">{user.display_name}</div>
          </div>
        ))}

        {/* Új user gomb */}
        {showCreateNew && !showForm && (
          <div 
            className="user-card new-user"
            onClick={() => setShowForm(true)}
          >
            <div className="user-avatar" style={{ background: '#28a745' }}>
              +
            </div>
            <div className="user-name">Új felhasználó</div>
          </div>
        )}
      </div>

      {/* Új user form */}
      {showForm && (
      <div className="user-form">
        <h4>Új felhasználó</h4>
        <div>
          <input
            type="text"
            placeholder="Felhasználónév *"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Megjelenített név *"
            value={formData.display_name}
            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email (opcionális)"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <div className="color-picker">
            <label>Avatar szín:</label>
            <div className="color-grid">
              {AVATAR_COLORS.map(color => (
                <div
                  key={color}
                  className={`color-option ${formData.avatar_color === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setFormData({...formData, avatar_color: color})}
                />
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
        .user-selector {
          margin: 15px 0;
        }

        .user-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .user-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .user-card.selected {
          border-color: #007bff;
          background: #e7f3ff;
        }

        .user-card.new-user {
          border-style: dashed;
          border-color: #28a745;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }

        .user-name {
          font-size: 14px;
          text-align: center;
          font-weight: 500;
        }

        .user-form {
          padding: 20px;
          border: 2px solid #007bff;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .user-form h4 {
          margin-top: 0;
          color: #007bff;
        }

        .user-form input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .color-picker {
          margin: 15px 0;
        }

        .color-picker label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .color-option {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          cursor: pointer;
          border: 3px solid transparent;
          transition: all 0.2s;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: #000;
          box-shadow: 0 0 0 2px white, 0 0 0 4px #000;
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

export default UserSelector;
