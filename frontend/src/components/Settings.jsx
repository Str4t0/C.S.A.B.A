import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usersAPI, locationsAPI } from '../services/api';
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  
  // Users state
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ 
    username: '', 
    first_name: '', 
    last_name: '', 
    email: '', 
    phone: '' 
  });
  
  // Locations state
  const [locations, setLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({ 
    country: 'Magyarország', 
    postal_code: '', 
    city: '', 
    address: '' 
  });

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Users load error:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await locationsAPI.getAll();
      setLocations(data);
    } catch (error) {
      console.error('Locations load error:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, newUser);
      } else {
        await usersAPI.create(newUser);
      }
      setNewUser({ username: '', first_name: '', last_name: '', email: '', phone: '' });
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteUser = async (user) => {
    if (confirm(`Biztosan törlöd "${user.display_name}" felhasználót?`)) {
      try {
        await usersAPI.delete(user.id);
        loadUsers();
      } catch (error) {
        alert('Hiba: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await locationsAPI.update(editingLocation.id, newLocation);
      } else {
        await locationsAPI.create(newLocation);
      }
      setNewLocation({ country: 'Magyarország', postal_code: '', city: '', address: '' });
      setEditingLocation(null);
      loadLocations();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteLocation = async (loc) => {
    if (confirm(`Biztosan törlöd "${loc.city}" helyszínt? A tárgyakból el lesz távolítva a helyszín.`)) {
      try {
        await locationsAPI.delete(loc.id);
        loadLocations();
      } catch (error) {
        alert('Hiba: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>⚙️ Beállítások</h1>
          <p>Alkalmazás funkciók és navigáció</p>
        </div>
        <Link to="/" className="settings-home-link">← Vissza a főoldalra</Link>
      </div>

      <div className="settings-grid">
        {/* Felhasználók kártya */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon">👤</span>
            <h2>Felhasználók kezelése</h2>
          </div>
          <p>Felhasználók hozzáadása, szerkesztése, törlése</p>
          <button 
            className="settings-btn"
            onClick={() => {
              loadUsers();
              setShowUserModal(true);
            }}
          >
            🔧 Kezelés
          </button>
        </div>

        {/* Helyszínek kártya */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon">📍</span>
            <h2>Helyszínek kezelése</h2>
          </div>
          <p>Címek hozzáadása, szerkesztése, törlése</p>
          <button 
            className="settings-btn"
            onClick={() => {
              loadLocations();
              setShowLocationModal(true);
            }}
          >
            🔧 Kezelés
          </button>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="settings-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h2>👤 Felhasználók kezelése</h2>
              <button className="settings-modal-close" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <div className="settings-modal-content">
              <p className="settings-count">Jelenleg <strong>{users.length} felhasználó</strong> van a rendszerben.</p>
              
              {users.length > 0 && (
                <div className="settings-list">
                  {users.map(user => (
                    <div key={user.id} className="settings-list-item">
                      <div className="settings-list-avatar" style={{ background: user.avatar_color || '#6B9BD5' }}>
                        {(user.last_name || user.username)?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="settings-list-info">
                        <h3>{user.display_name || user.username}</h3>
                        <p>{user.email || 'Nincs email'} {user.phone && `• ${user.phone}`}</p>
                      </div>
                      <div className="settings-list-actions">
                        <button 
                          className="settings-btn-small settings-btn-edit"
                          onClick={() => {
                            setEditingUser(user);
                            setNewUser({ 
                              username: user.username, 
                              first_name: user.first_name || '', 
                              last_name: user.last_name || '',
                              email: user.email || '',
                              phone: user.phone || ''
                            });
                          }}
                        >✏️</button>
                        <button 
                          className="settings-btn-small settings-btn-delete"
                          onClick={() => handleDeleteUser(user)}
                        >🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="settings-form-container">
                <h3>{editingUser ? '✏️ Felhasználó szerkesztése' : '➕ Új felhasználó'}</h3>
                <form onSubmit={handleCreateUser}>
                  <input
                    type="text"
                    placeholder="Felhasználónév (egyedi azonosító)"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                    disabled={!!editingUser}
                  />
                  <div className="settings-form-row">
                    <input
                      type="text"
                      placeholder="Családnév"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Keresztnév"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="settings-form-row">
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                    <input
                      type="tel"
                      placeholder="Telefonszám"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                  <div className="settings-form-buttons">
                    <button type="submit" className="settings-btn settings-btn-primary">
                      {editingUser ? '💾 Mentés' : '➕ Hozzáadás'}
                    </button>
                    {editingUser && (
                      <button 
                        type="button" 
                        className="settings-btn settings-btn-secondary"
                        onClick={() => {
                          setEditingUser(null);
                          setNewUser({ username: '', first_name: '', last_name: '', email: '', phone: '' });
                        }}
                      >
                        ✕ Mégse
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="settings-modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h2>📍 Helyszínek kezelése</h2>
              <button className="settings-modal-close" onClick={() => setShowLocationModal(false)}>✕</button>
            </div>
            <div className="settings-modal-content">
              <p className="settings-count">Jelenleg <strong>{locations.length} helyszín</strong> van a rendszerben.</p>
              
              {locations.length > 0 && (
                <div className="settings-list">
                  {locations.map(loc => (
                    <div key={loc.id} className="settings-list-item">
                      <div className="settings-list-avatar settings-list-avatar-location">
                        📍
                      </div>
                      <div className="settings-list-info">
                        <h3>{loc.city}{loc.address && `, ${loc.address}`}</h3>
                        <p>{loc.country} {loc.postal_code}</p>
                      </div>
                      <div className="settings-list-actions">
                        <button 
                          className="settings-btn-small settings-btn-edit"
                          onClick={() => {
                            setEditingLocation(loc);
                            setNewLocation({ 
                              country: loc.country || 'Magyarország', 
                              postal_code: loc.postal_code || '',
                              city: loc.city || '',
                              address: loc.address || ''
                            });
                          }}
                        >✏️</button>
                        <button 
                          className="settings-btn-small settings-btn-delete"
                          onClick={() => handleDeleteLocation(loc)}
                        >🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="settings-form-container">
                <h3>{editingLocation ? '✏️ Helyszín szerkesztése' : '➕ Új helyszín'}</h3>
                <form onSubmit={handleCreateLocation}>
                  <div className="settings-form-row">
                    <input
                      type="text"
                      placeholder="Ország"
                      value={newLocation.country}
                      onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Irányítószám"
                      value={newLocation.postal_code}
                      onChange={(e) => setNewLocation({ ...newLocation, postal_code: e.target.value })}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Helység (város)"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Lakcím (utca, házszám)"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  />
                  <div className="settings-form-buttons">
                    <button type="submit" className="settings-btn settings-btn-primary">
                      {editingLocation ? '💾 Mentés' : '➕ Hozzáadás'}
                    </button>
                    {editingLocation && (
                      <button 
                        type="button" 
                        className="settings-btn settings-btn-secondary"
                        onClick={() => {
                          setEditingLocation(null);
                          setNewLocation({ country: 'Magyarország', postal_code: '', city: '', address: '' });
                        }}
                      >
                        ✕ Mégse
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
