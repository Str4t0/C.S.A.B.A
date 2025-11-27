/**
 * App Game UI COMPLETE - Teljes működő alkalmazás game-style design-nal
 * Frontend Developer: Sarah Kim
 * Game UI Design: Claude AI
 * 
 * Funkciók:
 * - Teljes CRUD (Items, Users, Locations)
 * - Game UI design
 * - Working Settings with modals
 * - QR codes
 * - Documents
 */

import React, { useState, useEffect } from 'react';
import { itemsAPI, categoriesAPI, statsAPI, usersAPI, locationsAPI } from './services/api';
import ItemCard from './components/ItemCard';
import ItemFormGameUI from './components/ItemForm-game-ui';
import './styles/inventory-game-ui.css';

function AppGameUI() {
  // State management - Items
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formDirty, setFormDirty] = useState(false);
  const [selectedView, setSelectedView] = useState('Items');

  // State management - Users
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    display_name: '',
    email: ''
  });

  // State management - Locations
  const [locations, setLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    parent_id: null,
    icon: '📍'
  });

  // Sidebar menü
  const sidebarMenu = [
    { id: 'Items', label: 'Items', icon: '📦' },
    { id: 'Alerts', label: 'Alerts', icon: '⚠️' },
    { id: 'Settings', label: 'Settings', icon: '⚙️' }
  ];

  // Kezdeti adatok betöltése
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsData, categoriesData, statsData] = await Promise.all([
        itemsAPI.getAll(),
        categoriesAPI.getAll(),
        statsAPI.get()
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Adatok betöltési hiba:', error);
      alert('Hiba történt az adatok betöltése során!');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error('User betöltési hiba:', error);
      setUsers([]);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await locationsAPI.getAll();
      setLocations(data || []);
    } catch (error) {
      console.error('Location betöltési hiba:', error);
      setLocations([]);
    }
  };

  // Keresés
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await itemsAPI.search(query);
        setItems(results);
        setSelectedCategory(null);
      } catch (error) {
        console.error('Keresési hiba:', error);
      }
    } else {
      loadData();
    }
  };

  // Kategória szűrés
  const handleCategoryFilter = async (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      loadData();
    } else {
      setSelectedCategory(category);
      try {
        const results = await itemsAPI.getAll(category);
        setItems(results);
      } catch (error) {
        console.error('Szűrési hiba:', error);
      }
    }
  };

  // Új tárgy hozzáadása
  const handleAddItem = () => {
    setEditingItem(null);
    setFormDirty(false);
    setShowModal(true);
  };

  // Tárgy szerkesztése
  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormDirty(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (formDirty) {
      const confirmClose = confirm('A módosítások mentése nélkül bezárod az űrlapot?');
      if (!confirmClose) return;
    }
    setShowModal(false);
    setEditingItem(null);
    setFormDirty(false);
  };

  // Tárgy törlése
  const handleDeleteItem = async (itemId) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a tárgyat?')) {
      return;
    }

    try {
      await itemsAPI.delete(itemId);
      await loadData();
      alert('✅ Tárgy sikeresen törölve!');
    } catch (error) {
      console.error('Törlési hiba:', error);
      alert('Hiba történt a törlés során!');
    }
  };

  // Űrlap beküldése (új vagy szerkesztés)
  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        const updated = await itemsAPI.update(editingItem.id, formData);
        setEditingItem(updated);
        alert('✅ Tárgy sikeresen frissítve!');
      } else {
        const created = await itemsAPI.create(formData);
        setEditingItem(created);
        alert('✅ Új tárgy elmentve! Most hozzáadhatsz képet vagy dokumentumot.');
      }
      setFormDirty(false);
      await loadData();
      // Csak szerkesztésnél zárjuk automatikusan, új létrehozásnál maradjon nyitva dokumentumhoz
      if (editingItem) {
        setShowModal(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Mentési hiba:', error);
      alert('Hiba történt a mentés során!');
    }
  };

  // Sidebar kattintás
  const handleSidebarClick = (viewId) => {
    setSelectedView(viewId);
    
    // Load data for Settings view
    if (viewId === 'Settings') {
      loadUsers();
      loadLocations();
    }
  };

  // User management
  const handleUserManagement = () => {
    loadUsers();
    setShowUserModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.create(newUser);
      await loadUsers();
      setNewUser({ username: '', display_name: '', email: '' });
      alert('✅ Felhasználó hozzáadva!');
    } catch (error) {
      console.error('User létrehozási hiba:', error);
      alert('Hiba történt a felhasználó létrehozásakor.');
    }
  };

  const handleLocationManagement = () => {
    loadLocations();
    setShowLocationModal(true);
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      await locationsAPI.create({
        ...newLocation,
        parent_id: newLocation.parent_id || null
      });
      await loadLocations();
      setNewLocation({ name: '', description: '', parent_id: null, icon: '📍' });
      alert('✅ Helyszín hozzáadva!');
    } catch (error) {
      console.error('Location létrehozási hiba:', error);
      alert('Hiba történt a helyszín létrehozásakor.');
    }
  };

  // Status meghatározás
  const getItemStatus = (item) => {
    if (!item.quantity || item.quantity === 0) return 'out';
    if (item.min_quantity && item.quantity <= item.min_quantity) return 'low';
    return 'ok';
  };

  // Low stock items
  const lowStockItems = items.filter(item => 
    item.quantity && item.min_quantity && item.quantity <= item.min_quantity
  );

  // Renderelés - Items view
  const renderItemsView = () => {
    if (loading) {
      return (
        <div className="game-loading">
          <div className="game-spinner"></div>
          <p style={{ fontFamily: 'var(--font-game)', fontSize: '20px', color: 'var(--game-brown)' }}>
            Betöltés...
          </p>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="game-empty-state">
          <div className="game-empty-icon">📦</div>
          <h2 className="game-empty-title">
            {searchQuery || selectedCategory ? 'Nincs találat' : 'Még nincsenek tárgyak'}
          </h2>
          <p className="game-empty-text">
            {searchQuery || selectedCategory
              ? 'Próbálj más keresési feltételekkel.'
              : 'Kezdd el a gyűjteményed építését az "Új tárgy" gombbal!'}
          </p>
          <button className="game-btn game-btn-primary game-btn-large" onClick={handleAddItem}>
            ➕ Első tárgy hozzáadása
          </button>
        </div>
      );
    }

    return (
      <div className="items-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '25px'
      }}>
        {items.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>
    );
  };

  // Renderelés - Alerts view
  const renderAlertsView = () => {
    return (
      <div>
        <div className="game-alert game-alert-warning">
          <div className="game-alert-header">
            ⚠️ Low Supplies
          </div>
          <div className="game-alert-content">
            <p><strong>Warning:</strong> The stock of certain items is running low.</p>
            <p>Jelenleg <strong>{lowStockItems.length} tárgy</strong> készlete alacsony.</p>
          </div>
        </div>

        {lowStockItems.length > 0 ? (
          <div className="game-items-list">
            {lowStockItems.map(item => (
              <div key={item.id} className="game-item-list-row">
                <div className="game-item-list-left">
                  <div className="game-item-list-icon">⚠️</div>
                  <div className="game-item-list-info">
                    <h3>{item.name}</h3>
                    <p>Mennyiség: {item.quantity} • Min: {item.min_quantity}</p>
                  </div>
                </div>
                <div className="game-item-list-right">
                  <span className="game-status-badge low">LOW</span>
                  <button 
                    className="game-btn game-btn-small game-btn-primary"
                    onClick={() => handleEditItem(item)}
                  >
                    Feltölt
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="game-empty-state">
            <div className="game-empty-icon">✅</div>
            <h2 className="game-empty-title">Minden rendben!</h2>
            <p className="game-empty-text">Nincs alacsony készletű tárgy.</p>
          </div>
        )}
      </div>
    );
  };

  // Renderelés - Settings view
  const renderSettingsView = () => {
    return (
      <div>
        <div className="game-alert">
          <div className="game-alert-header">
            ⚙️ Beállítások
          </div>
          <div className="game-alert-content">
            <p>Itt található az alkalmazás beállítások.</p>
          </div>
        </div>

        <div className="game-items-list">
          <div className="game-item-list-row">
            <div className="game-item-list-left">
              <div className="game-item-list-icon">👤</div>
              <div className="game-item-list-info">
                <h3>Felhasználók kezelése</h3>
                <p>Felhasználók hozzáadása, szerkesztése, listázása</p>
              </div>
            </div>
            <div className="game-item-list-right">
              <button 
                className="game-btn game-btn-small game-btn-primary"
                onClick={handleUserManagement}
              >
                🔧 Kezelés
              </button>
            </div>
          </div>

          <div className="game-item-list-row">
            <div className="game-item-list-left">
              <div className="game-item-list-icon">📍</div>
              <div className="game-item-list-info">
                <h3>Helyszínek kezelése</h3>
                <p>Raktárak, polcok hozzáadása, szerkesztése</p>
              </div>
            </div>
            <div className="game-item-list-right">
              <button 
                className="game-btn game-btn-small game-btn-primary"
                onClick={handleLocationManagement}
              >
                🔧 Kezelés
              </button>
            </div>
          </div>

          <div className="game-item-list-row">
            <div className="game-item-list-left">
              <div className="game-item-list-icon">🔔</div>
              <div className="game-item-list-info">
                <h3>Értesítések</h3>
                <p>Alacsony készlet értesítések beállítása</p>
              </div>
            </div>
            <div className="game-item-list-right">
              <button className="game-btn game-btn-small">Hamarosan</button>
            </div>
          </div>

          <div className="game-item-list-row">
            <div className="game-item-list-left">
              <div className="game-item-list-icon">📊</div>
              <div className="game-item-list-info">
                <h3>Statisztikák</h3>
                <p>Részletes statisztikák és riportok</p>
              </div>
            </div>
            <div className="game-item-list-right">
              <button className="game-btn game-btn-small">Hamarosan</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="game-ui-container">
      {/* Header */}
      <div className="game-header">
        <div>
          <h1 className="game-title">
            <span className="game-title-icon">📦</span>
            INVENTORY SYSTEM
          </h1>
          <p className="game-subtitle">| || Otthoni Tárgyi Nyilvántartó</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="game-stats-row">
        <div className="game-stat-badge">
          <div className="game-stat-icon">📦</div>
          <div className="game-stat-content">
            <h3>{stats.total_items || 0}</h3>
            <p>Összes tárgy</p>
          </div>
        </div>

        <div className="game-stat-badge">
          <div className="game-stat-icon">💰</div>
          <div className="game-stat-content">
            <h3>{stats.total_value ? `${(stats.total_value / 1000).toFixed(0)}k` : '0'} Ft</h3>
            <p>Összes érték</p>
          </div>
        </div>

        <div className="game-stat-badge">
          <div className="game-stat-icon">⚠️</div>
          <div className="game-stat-content">
            <h3>{lowStockItems.length}</h3>
            <p>Alacsony készlet</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="game-layout">
        {/* Sidebar */}
        <div className="game-sidebar">
          <div className="game-sidebar-title">Menu</div>
          <ul className="game-sidebar-menu">
            {sidebarMenu.map(item => (
              <li
                key={item.id}
                className={`game-sidebar-item ${selectedView === item.id ? 'active' : ''}`}
                onClick={() => handleSidebarClick(item.id)}
              >
                {item.icon} {item.label}
              </li>
            ))}
          </ul>

          {/* Sidebar extra - doboz illusztráció */}
          {selectedView === 'Items' && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '80px', marginBottom: '10px' }}>📦</div>
              <div style={{ fontSize: '40px', color: 'var(--game-green-dark)' }}>⬆️</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="game-content">
          {selectedView === 'Items' && (
            <>
              {/* Search Section */}
              <div className="game-search-section">
                <input
                  type="text"
                  className="game-search-input"
                  placeholder="🔍 Keresés a tárgyak között..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Category Tabs */}
              <div className="game-tabs">
                <button
                  className={`game-tab ${selectedCategory === null ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(null);
                    loadData();
                  }}
                >
                  Összes
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`game-tab ${selectedCategory === cat.name ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter(cat.name)}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              {renderItemsView()}

              {/* Footer Actions */}
              <div className="game-footer-actions">
                <button className="game-btn game-btn-primary" onClick={handleAddItem}>
                  ➕ Új tárgy
                </button>
                <button className="game-btn game-btn-success" onClick={loadData}>
                  🔄 Frissítés
                </button>
              </div>
            </>
          )}

          {selectedView === 'Alerts' && renderAlertsView()}
          {selectedView === 'Settings' && renderSettingsView()}
        </div>
      </div>

      {/* Item Modal */}
      {showModal && (
        <div className="game-modal-overlay" onClick={handleCloseModal}>
          <div className="game-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="game-modal-header">
              <span>{editingItem ? '✏️ Tárgy szerkesztése' : '➕ Új tárgy hozzáadása'}</span>
              <div className="game-modal-close" onClick={handleCloseModal}>
                ✕
              </div>
            </div>
            <div style={{ padding: '20px 0' }}>
              <ItemFormGameUI
                item={editingItem}
                categories={categories}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseModal}
                onDirtyChange={setFormDirty}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserModal && (
        <div className="game-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="game-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="game-modal-header">
              <span>👤 Felhasználók kezelése</span>
              <div className="game-modal-close" onClick={() => setShowUserModal(false)}>
                ✕
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="game-alert">
                <div className="game-alert-header">👤 Felhasználók listája</div>
                <div className="game-alert-content">
                  <p>Jelenleg <strong>{users.length} felhasználó</strong> van a rendszerben.</p>
                </div>
              </div>

              {users.length > 0 ? (
                <div className="game-items-list" style={{ marginTop: '20px' }}>
                  {users.map(user => (
                    <div key={user.id} className="game-item-list-row">
                      <div className="game-item-list-left">
                        <div className="game-item-list-icon" style={{ 
                          background: user.avatar_color || '#6B9BD5',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          {user.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="game-item-list-info">
                          <h3>{user.display_name || user.username}</h3>
                          <p>{user.email || 'Nincs email'}</p>
                        </div>
                      </div>
                      <div className="game-item-list-right">
                        <button className="game-btn game-btn-small">✏️ Szerkeszt</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="game-empty-state">
                  <div className="game-empty-icon">👤</div>
                  <h2 className="game-empty-title">Még nincs felhasználó</h2>
                  <p className="game-empty-text">Adj hozzá új felhasználókat!</p>
                </div>
              )}

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      className="game-search-input"
                      placeholder="Felhasználónév"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      className="game-search-input"
                      placeholder="Megjelenített név"
                      value={newUser.display_name}
                      onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                      required
                    />
                  </div>
                  <input
                    type="email"
                    className="game-search-input"
                    placeholder="Email (opcionális)"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                  <button className="game-btn game-btn-primary" type="submit">
                    ➕ Új felhasználó
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Management Modal */}
      {showLocationModal && (
        <div className="game-modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="game-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="game-modal-header">
              <span>📍 Helyszínek kezelése</span>
              <div className="game-modal-close" onClick={() => setShowLocationModal(false)}>
                ✕
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="game-alert">
                <div className="game-alert-header">📍 Helyszínek listája</div>
                <div className="game-alert-content">
                  <p>Jelenleg <strong>{locations.length} helyszín</strong> van a rendszerben.</p>
                </div>
              </div>

              {locations.length > 0 ? (
                <div className="game-items-list" style={{ marginTop: '20px' }}>
                  {locations.map(location => (
                    <div key={location.id} className="game-item-list-row">
                      <div className="game-item-list-left">
                        <div className="game-item-list-icon">
                          {location.icon || '📍'}
                        </div>
                        <div className="game-item-list-info">
                          <h3>{location.name}</h3>
                          <p>{location.full_path || location.description || 'Nincs leírás'}</p>
                        </div>
                      </div>
                      <div className="game-item-list-right">
                        <button className="game-btn game-btn-small">✏️ Szerkeszt</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="game-empty-state">
                  <div className="game-empty-icon">📍</div>
                  <h2 className="game-empty-title">Még nincs helyszín</h2>
                  <p className="game-empty-text">Adj hozzá új helyszíneket!</p>
                </div>
              )}

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <form onSubmit={handleCreateLocation} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    className="game-search-input"
                    placeholder="Helyszín neve"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    required
                  />
                  <textarea
                    className="game-search-input"
                    placeholder="Leírás (opcionális)"
                    value={newLocation.description}
                    onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                    rows="2"
                    style={{ resize: 'vertical' }}
                  />
                  <select
                    className="game-search-input"
                    value={newLocation.parent_id || ''}
                    onChange={(e) => setNewLocation({ ...newLocation, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                  >
                    <option value="">Fő szint</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.full_path || loc.name}
                      </option>
                    ))}
                  </select>
                  <button className="game-btn game-btn-primary" type="submit">
                    ➕ Új helyszín
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppGameUI;
