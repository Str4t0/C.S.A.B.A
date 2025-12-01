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
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { itemsAPI, categoriesAPI, statsAPI, usersAPI, locationsAPI, imagesAPI, documentsAPI } from './services/api';
import ItemCard from './components/ItemCard';
import ItemFormGameUI from './components/ItemForm-game-ui';
import Alerts from './components/Alerts';
import Statistics from './components/Statistics';
import QRScanner from './components/QRScanner';
import './styles/inventory-game-ui.css';

function AppGameUI() {
  // State management - Items
  const [allItems, setAllItems] = useState([]);  // Összes tárgy (szűrés nélkül)
  const [items, setItems] = useState([]);  // Megjelenített (szűrt) tárgyak
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formDirty, setFormDirty] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // State management - Users
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

  // State management - Locations
  const [locations, setLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({
    country: 'Magyarország',
    postal_code: '',
    city: '',
    address: ''
  });

  // Sidebar menü - JAVÍTVA: magyar nevek
  const sidebarMenu = [
    { id: 'Items', label: 'Tárgyak', icon: '📦', path: '/' },
    { id: 'Alerts', label: 'Értesítések', icon: '⚠️', path: '/alerts' },
    { id: 'Statistics', label: 'Statisztikák', icon: '📊', path: '/statistics' },
    { id: 'QR', label: 'QR Scanner', icon: '📷', path: '/qr-scanner' },
    { id: 'Settings', label: 'Beállítások', icon: '⚙️', path: '/settings' }
  ];

  const activeView = (() => {
    switch (location.pathname) {
      case '/alerts':
        return 'Alerts';
      case '/statistics':
        return 'Statistics';
      case '/qr-scanner':
        return 'QR';
      case '/settings':
        return 'Settings';
      default:
        return 'Items';
    }
  })();

  // Kezdeti adatok betöltése
  useEffect(() => {
    loadData();
  }, []);

  // Alert-ből/Statisztikákból érkező item preview vagy szerkesztés
  useEffect(() => {
    const editItemId = location.state?.editItemId;
    const previewItemId = location.state?.previewItemId;
    
    // Preview megnyitása
    if (previewItemId) {
      console.log('👁️ Preview navigáció: previewItemId =', previewItemId);
      const itemToPreview = items.find(item => item.id === previewItemId);
      if (itemToPreview) {
        console.log('✅ Item megtalálva a listában (preview):', itemToPreview);
        setPreviewItem(itemToPreview);
        setPreviewIndex(0);
        navigate('/', { replace: true, state: null });
      } else if (!loading) {
        console.log('📥 Item betöltése API-ból (preview)...');
        itemsAPI.getById(previewItemId)
          .then((item) => {
            console.log('✅ Item betöltve (preview):', item);
            setPreviewItem(item);
            setPreviewIndex(0);
            navigate('/', { replace: true, state: null });
          })
          .catch((error) => {
            console.error('❌ Item betöltési hiba (preview):', error);
            navigate('/', { replace: true, state: null });
          });
      }
    }
    // Szerkesztés megnyitása
    else if (editItemId) {
      console.log('🔔 Edit navigáció: editItemId =', editItemId);
      const itemToEdit = items.find(item => item.id === editItemId);
      if (itemToEdit) {
        console.log('✅ Item megtalálva a listában:', itemToEdit);
        handleEditItem(itemToEdit);
        navigate('/', { replace: true, state: null });
      } else if (!loading) {
        console.log('📥 Item betöltése API-ból...');
        itemsAPI.getById(editItemId)
          .then((item) => {
            console.log('✅ Item betöltve:', item);
            handleEditItem(item);
            navigate('/', { replace: true, state: null });
          })
          .catch((error) => {
            console.error('❌ Item betöltési hiba:', error);
            navigate('/', { replace: true, state: null });
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.key, items.length, loading]);

  const loadData = async (resetFilters = false) => {
    setLoading(true);
    try {
      const [itemsData, categoriesData, statsData] = await Promise.all([
        itemsAPI.getAll(),
        categoriesAPI.getAll(),
        statsAPI.get()
      ]);
      setAllItems(itemsData);  // Összes tárgy mentése
      setCategories(categoriesData);
      setStats(statsData);
      
      if (resetFilters) {
        // Szűrők resetálása
        setSearchQuery('');
        setSelectedCategory(null);
        setItems(itemsData);
      } else {
        // Szűrők megtartása - újra alkalmazzuk a szűrést
        let filtered = [...itemsData];
        if (selectedCategory) {
          filtered = filtered.filter(item => item.category === selectedCategory);
        }
        if (searchQuery && searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase().trim();
          filtered = filtered.filter(item => 
            item.name?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.category?.toLowerCase().includes(searchLower) ||
            item.notes?.toLowerCase().includes(searchLower)
          );
        }
        setItems(filtered);
      }
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
  // Szűrés - keresés és kategória EGYÜTT működik
  const filterItems = (query, category) => {
    let filtered = [...allItems];
    
    // Kategória szűrés
    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }
    
    // Keresés szűrés (név, leírás, kategória)
    if (query && query.trim()) {
      const searchLower = query.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    setItems(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterItems(query, selectedCategory);
  };

  // Kategória szűrés
  const handleCategoryFilter = (category) => {
    if (selectedCategory === category) {
      // Ha ugyanarra kattintunk, töröljük a szűrést
      setSelectedCategory(null);
      filterItems(searchQuery, null);
    } else {
      setSelectedCategory(category);
      filterItems(searchQuery, category);
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
        console.log('🔄 Item frissítése...', {
          itemId: editingItem.id,
          formData_images: formData.images,
          formData_images_count: formData.images?.length || 0
        });
        const updated = await itemsAPI.update(editingItem.id, formData);
        console.log('✅ Item frissítve, válasz:', {
          updated_images: updated.images,
          updated_images_count: updated.images?.length || 0
        });
        // JAVÍTVA: Frissítsük az editingItem-et az új adatokkal, hogy a gallery is frissüljön
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
      const backendDetail = error?.response?.data?.detail;
      const message = backendDetail
        ? `Hiba történt a mentés során: ${Array.isArray(backendDetail) ? backendDetail.map(d => d.msg || d).join('\n') : backendDetail}`
        : 'Hiba történt a mentés során!';
      alert(message);
    }
  };

  useEffect(() => {
    if (activeView === 'Settings') {
      loadUsers();
      loadLocations();
    }
  }, [activeView]);

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
      setNewUser({ username: '', first_name: '', last_name: '', email: '', phone: '' });
      alert('✅ Felhasználó hozzáadva!');
    } catch (error) {
      console.error('User létrehozási hiba:', error);
      alert('Hiba: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleLocationManagement = () => {
    loadLocations();
    setShowLocationModal(true);
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      await locationsAPI.create(newLocation);
      await loadLocations();
      setNewLocation({ country: 'Magyarország', postal_code: '', city: '', address: '' });
      alert('✅ Helyszín hozzáadva!');
    } catch (error) {
      console.error('Location létrehozási hiba:', error);
      alert('Hiba: ' + (error.response?.data?.detail || error.message));
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
            onPreview={(chosen, startIndex = 0) => {
              setPreviewIndex(startIndex);
              setPreviewItem(chosen);
            }}
          />
        ))}
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
            C.S.A.B.A
          </h1>
          <p className="game-subtitle">| || Central Storage And Business Application</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="game-stats-row">
        {/* JAVÍTVA: Klikkelhetős stat badge-ek + auto scroll */}
        <div 
          className="game-stat-badge clickable" 
          onClick={() => {
            navigate('/');
            // Görgetés a tetejére
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ cursor: 'pointer' }}
          
        >
          <div className="game-stat-icon">📦</div>
          <div className="game-stat-content">
            <h3>{stats.total_items || 0}</h3>
            <p>Összes tárgy</p>
          </div>
        </div>

        <div 
          className="game-stat-badge clickable" 
          onClick={() => {
            navigate('/statistics');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ cursor: 'pointer' }}
          
        >
          <div className="game-stat-icon">💰</div>
          <div className="game-stat-content">
            <h3>{stats.total_value ? `${(stats.total_value / 1000).toFixed(0)}k` : '0'} Ft</h3>
            <p>Összes érték</p>
          </div>
        </div>

        <div 
          className="game-stat-badge clickable" 
          onClick={() => {
            navigate('/alerts');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ cursor: 'pointer' }}
          
        >
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
                className={`game-sidebar-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  // Görgetés a tetejére
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title={item.label}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </li>
            ))}
          </ul>

          {/* Sidebar extra - doboz illusztráció */}
          {activeView === 'Items' && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '80px', marginBottom: '10px' }}>📦</div>
              <div style={{ fontSize: '40px', color: 'var(--game-green-dark)' }}>⬆️</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="game-content">
          <Routes>
            <Route
              path="/"
              element={(
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
                        filterItems(searchQuery, null);
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
                    <button className="game-btn game-btn-success" onClick={() => loadData(true)}>
                      🔄 Frissítés
                    </button>
                  </div>
                </>
              )}
            />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/qr-scanner" element={<QRScanner />} />
            <Route path="/settings" element={renderSettingsView()} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* Item Preview Modal - JAVÍTVA: görgetés */}
      {previewItem && (
        <div className="game-modal-overlay" onClick={() => { setPreviewItem(null); setPreviewIndex(0); }}>
          <div 
            className="game-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '980px',
              maxHeight: '90vh',  // JAVÍTVA: max magasság
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="game-modal-header" style={{ flexShrink: 0 }}>
              <span>👁️ Előnézet</span>
              <div className="game-modal-close" onClick={() => { setPreviewItem(null); setPreviewIndex(0); }}>✕</div>
            </div>
            <div style={{ 
              padding: '20px', 
              display: 'grid', 
              gap: '16px',
              overflowY: 'auto',  // JAVÍTVA: görgetés engedélyezése
              flex: 1,
              minHeight: 0  // JAVÍTVA: flexbox overflow kezelés
            }}>
              {(() => {
                const gallery = (previewItem.images && previewItem.images.length > 0
                  ? previewItem.images
                  : (previewItem.image_filename ? [{ filename: previewItem.image_filename, orientation: null }] : [])
                );
                const active = gallery[previewIndex] || gallery[0];

                return (
                  <>
                    <div className="preview-gallery-main">
                      {active ? (
                        <div className={`preview-main-frame ${active.orientation || 'square'}`} onClick={() => setPreviewIndex((previewIndex + 1) % gallery.length)}>
                          <img src={imagesAPI.getImageUrl(active.filename)} alt={previewItem.name} />
                          {gallery.length > 1 && (
                            <div className="preview-nav">
                              <button onClick={(e) => { e.stopPropagation(); setPreviewIndex((previewIndex - 1 + gallery.length) % gallery.length); }}>◀</button>
                              <span>{previewIndex + 1} / {gallery.length}</span>
                              <button onClick={(e) => { e.stopPropagation(); setPreviewIndex((previewIndex + 1) % gallery.length); }}>▶</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="preview-main-frame empty">Nincs kép</div>
                      )}
                      {gallery.length > 1 && (
                        <div className="preview-thumbs">
                          {gallery.map((img, idx) => (
                            <button
                              key={img.filename}
                              className={`preview-thumb ${idx === previewIndex ? 'active' : ''}`}
                              onClick={() => setPreviewIndex(idx)}
                            >
                              <img src={imagesAPI.getThumbnailUrl(img.filename)} alt={previewItem.name} />
                              <small>{img.orientation === 'portrait' ? 'Álló' : img.orientation === 'landscape' ? 'Fekvő' : 'Kép'}</small>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="game-item-meta">
                      <div className="game-item-meta-row"><span className="game-item-meta-label">🏷️ Név:</span><span className="game-item-meta-value">{previewItem.name}</span></div>
                      <div className="game-item-meta-row"><span className="game-item-meta-label">📂 Kategória:</span><span className="game-item-meta-value">{previewItem.category}</span></div>
                      {previewItem.purchase_price && (
                        <div className="game-item-meta-row"><span className="game-item-meta-label">💰 Ár:</span><span className="game-item-meta-value">{previewItem.purchase_price.toLocaleString()} Ft</span></div>
                      )}
                      {previewItem.location?.full_path && (
                        <div className="game-item-meta-row"><span className="game-item-meta-label">📍 Hely:</span><span className="game-item-meta-value">{previewItem.location.full_path}</span></div>
                      )}
                      {previewItem.description && (
                        <div className="game-item-meta-row"><span className="game-item-meta-label">📝 Leírás:</span><span className="game-item-meta-value">{previewItem.description}</span></div>
                      )}
                    </div>

                    {previewItem.documents?.length > 0 && (
                      <div className="preview-documents">
                        <h4>📄 Dokumentumok</h4>
                        <div className="preview-doc-list">
                          {previewItem.documents.map(doc => (
                            <a
                              key={doc.id}
                              className="preview-doc-item"
                              href={documentsAPI.getDownloadUrl(doc.id)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              📎 {doc.original_filename || doc.filename}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

            </div>
            {/* JAVÍTVA: Footer kívül a görgethető területen */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end',
              padding: '15px 20px',
              borderTop: 'var(--border-medium) solid var(--game-brown)',
              background: 'var(--game-cream-light)',
              flexShrink: 0
            }}>
              <button className="game-btn" onClick={() => { setPreviewItem(null); handleEditItem(previewItem); }}>✏️ Szerkesztés</button>
              <button className="game-btn game-btn-secondary" onClick={() => setPreviewItem(null)}>Bezár</button>
            </div>
          </div>
        </div>
      )}

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
          <div className="game-modal" onClick={(e) => e.stopPropagation()} style={{ 
            maxWidth: '700px', 
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="game-modal-header" style={{ flexShrink: 0 }}>
              <span>👤 Felhasználók kezelése</span>
              <div className="game-modal-close" onClick={() => setShowUserModal(false)}>
                ✕
              </div>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div className="game-alert">
                <div className="game-alert-header">👤 Felhasználók listája</div>
                <div className="game-alert-content">
                  <p>Jelenleg <strong>{users.length} felhasználó</strong> van a rendszerben.</p>
                </div>
              </div>

              {users.length > 0 ? (
                <div className="game-items-list" style={{ marginTop: '20px' }}>
                  {users.map(user => (
                    <div key={user.id} style={{ 
                      background: 'var(--game-cream-light)',
                      borderRadius: 'var(--radius-medium)',
                      padding: '15px',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <div style={{ 
                        background: user.avatar_color || '#6B9BD5',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: 'white',
                        fontWeight: 'bold',
                        border: '3px solid var(--game-brown)',
                        flexShrink: 0
                      }}>
                        {(user.last_name || user.username)?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>{user.display_name || user.username}</h3>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--game-brown-medium)' }}>
                          {user.email || 'Nincs email'} {user.phone && `• ${user.phone}`}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button 
                          className="game-btn game-btn-small"
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
                          style={{ background: 'var(--game-blue)', borderColor: 'var(--game-blue-dark)', padding: '8px 12px' }}
                        >✏️</button>
                        <button 
                          className="game-btn game-btn-small"
                          onClick={async () => {
                            if (confirm(`Biztosan törlöd "${user.display_name}" felhasználót?`)) {
                              try {
                                await usersAPI.delete(user.id);
                                loadUsers();
                              } catch (err) {
                                alert('Hiba a törlés során: ' + err.message);
                              }
                            }
                          }}
                          style={{ background: 'var(--game-red)', borderColor: 'var(--game-red-dark)', padding: '8px 12px' }}
                        >🗑️</button>
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

              <div style={{ 
                marginTop: '20px', 
                padding: '20px', 
                background: 'var(--game-cream)',
                borderRadius: 'var(--radius-medium)',
                border: 'var(--border-medium) solid var(--game-brown)'
              }}>
                <h4 style={{ margin: '0 0 15px', fontSize: '16px' }}>
                  {editingUser ? '✏️ Felhasználó szerkesztése' : '➕ Új felhasználó'}
                </h4>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (editingUser) {
                      await usersAPI.update(editingUser.id, newUser);
                      setEditingUser(null);
                    } else {
                      await handleCreateUser(e);
                    }
                    setNewUser({ username: '', first_name: '', last_name: '', email: '', phone: '' });
                    loadUsers();
                  } catch (err) {
                    alert('Hiba: ' + (err.response?.data?.detail || err.message));
                  }
                }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    className="game-search-input"
                    placeholder="Felhasználónév (egyedi azonosító)"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                    disabled={!!editingUser}
                    style={{ padding: '12px', borderRadius: '8px' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      className="game-search-input"
                      placeholder="Családnév"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                      required
                      style={{ padding: '12px', borderRadius: '8px' }}
                    />
                    <input
                      type="text"
                      className="game-search-input"
                      placeholder="Keresztnév"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                      required
                      style={{ padding: '12px', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="email"
                      className="game-search-input"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      style={{ padding: '12px', borderRadius: '8px' }}
                    />
                    <input
                      type="tel"
                      className="game-search-input"
                      placeholder="Telefonszám"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      style={{ padding: '12px', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="game-btn game-btn-primary" type="submit" style={{ flex: 1 }}>
                      {editingUser ? '💾 Mentés' : '➕ Hozzáadás'}
                    </button>
                    {editingUser && (
                      <button 
                        type="button" 
                        className="game-btn game-btn-secondary"
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

      {/* Location Management Modal */}
      {showLocationModal && (
        <div className="game-modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="game-modal" onClick={(e) => e.stopPropagation()} style={{ 
            maxWidth: '700px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="game-modal-header" style={{ flexShrink: 0 }}>
              <span>📍 Helyszínek kezelése</span>
              <div className="game-modal-close" onClick={() => setShowLocationModal(false)}>
                ✕
              </div>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div className="game-alert">
                <div className="game-alert-header">📍 Helyszínek listája</div>
                <div className="game-alert-content">
                  <p>Jelenleg <strong>{locations.length} helyszín</strong> van a rendszerben.</p>
                </div>
              </div>

              {locations.length > 0 ? (
                <div className="game-items-list" style={{ marginTop: '20px' }}>
                  {locations.map(loc => (
                    <div key={loc.id} style={{ 
                      background: 'var(--game-cream-light)',
                      borderRadius: 'var(--radius-medium)',
                      padding: '15px',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <div style={{ 
                        background: 'var(--game-green)',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        border: '3px solid var(--game-brown)',
                        flexShrink: 0
                      }}>
                        📍
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>{loc.city}{loc.address && `, ${loc.address}`}</h3>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--game-brown-medium)' }}>
                          {loc.country} {loc.postal_code}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button 
                          className="game-btn game-btn-small"
                          onClick={() => {
                            setEditingLocation(loc);
                            setNewLocation({ 
                              country: loc.country || 'Magyarország', 
                              postal_code: loc.postal_code || '',
                              city: loc.city || '',
                              address: loc.address || ''
                            });
                          }}
                          style={{ background: 'var(--game-blue)', borderColor: 'var(--game-blue-dark)', padding: '8px 12px' }}
                        >✏️</button>
                        <button 
                          className="game-btn game-btn-small"
                          onClick={async () => {
                            if (confirm(`Biztosan törlöd "${loc.city}" helyszínt? A tárgyakból el lesz távolítva a helyszín.`)) {
                              try {
                                await locationsAPI.delete(loc.id);
                                loadLocations();
                              } catch (err) {
                                alert('Hiba a törlés során: ' + (err.response?.data?.detail || err.message));
                              }
                            }
                          }}
                          style={{ background: 'var(--game-red)', borderColor: 'var(--game-red-dark)', padding: '8px 12px' }}
                        >🗑️</button>
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

              <div style={{ 
                marginTop: '20px', 
                padding: '20px', 
                background: 'var(--game-cream)',
                borderRadius: 'var(--radius-medium)',
                border: 'var(--border-medium) solid var(--game-brown)'
              }}>
                <h4 style={{ margin: '0 0 15px', fontSize: '16px' }}>
                  {editingLocation ? '✏️ Helyszín szerkesztése' : '➕ Új helyszín'}
                </h4>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (editingLocation) {
                      await locationsAPI.update(editingLocation.id, newLocation);
                      setEditingLocation(null);
                    } else {
                      await handleCreateLocation(e);
                    }
                    setNewLocation({ country: 'Magyarország', postal_code: '', city: '', address: '' });
                    loadLocations();
                  } catch (err) {
                    alert('Hiba: ' + (err.response?.data?.detail || err.message));
                  }
                }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      className="game-search-input"
                      placeholder="Ország"
                      value={newLocation.country}
                      onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                      style={{ padding: '12px', borderRadius: '8px' }}
                    />
                    <input
                      type="text"
                      className="game-search-input"
                      placeholder="Irányítószám"
                      value={newLocation.postal_code}
                      onChange={(e) => setNewLocation({ ...newLocation, postal_code: e.target.value })}
                      style={{ padding: '12px', borderRadius: '8px' }}
                    />
                  </div>
                  <input
                    type="text"
                    className="game-search-input"
                    placeholder="Helység (város)"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    required
                    style={{ padding: '12px', borderRadius: '8px' }}
                  />
                  <input
                    type="text"
                    className="game-search-input"
                    placeholder="Lakcím (utca, házszám)"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    style={{ padding: '12px', borderRadius: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="game-btn game-btn-primary" type="submit" style={{ flex: 1 }}>
                      {editingLocation ? '💾 Mentés' : '➕ Hozzáadás'}
                    </button>
                    {editingLocation && (
                      <button 
                        type="button" 
                        className="game-btn game-btn-secondary"
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
}

export default AppGameUI;
