/**
 * App komponens - Fő alkalmazás
 * Frontend Developer: Sarah Kim
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { itemsAPI, categoriesAPI, statsAPI } from './services/api';
import ItemCard from './components/ItemCard';
import ItemForm from './components/ItemForm';
import './styles/main.css';
import Alerts from './components/Alerts';
import Statistics from './components/Statistics';
import QRScanner from './components/QRScanner';
import Settings from './components/Settings';

function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
    setShowModal(true);
  };

  // Tárgy szerkesztése
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowModal(true);
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
        await itemsAPI.update(editingItem.id, formData);
        alert('✅ Tárgy sikeresen frissítve!');
      } else {
        await itemsAPI.create(formData);
        alert('✅ Új tárgy sikeresen hozzáadva!');
      }
      setShowModal(false);
      setEditingItem(null);
      await loadData();
    } catch (error) {
      console.error('Mentési hiba:', error);
      alert('Hiba történt a mentés során!');
    }
  };

  // Szűrt items
  const displayedItems = items;

  const homeContent = (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🏠 Otthoni Tárgyi Nyilvántartás</h1>
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.total_items || 0}</div>
              <div className="stat-label">Tárgy</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.total_categories || 0}</div>
              <div className="stat-label">Kategória</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {stats.total_value ? `${(stats.total_value / 1000).toFixed(0)}k` : '0'}
              </div>
              <div className="stat-label">Érték (Ft)</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Controls */}
        <div className="controls">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Keresés név, kategória vagy leírás alapján..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="category-filter">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => handleCategoryFilter(cat.name)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          <button className="add-button" onClick={handleAddItem}>
            ➕ Új tárgy
          </button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Betöltés...</p>
          </div>
        ) : displayedItems.length > 0 ? (
          <div className="items-grid">
            {displayedItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2 className="empty-title">
              {searchQuery || selectedCategory ? 'Nincs találat' : 'Még nincsenek tárgyak'}
            </h2>
            <p className="empty-text">
              {searchQuery || selectedCategory
                ? 'Próbálj más keresési feltételekkel.'
                : 'Kezdd el a gyűjteményed építését az "Új tárgy" gombbal!'}
            </p>
            {!searchQuery && !selectedCategory && (
              <button className="add-button" onClick={handleAddItem}>
                ➕ Első tárgy hozzáadása
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingItem ? '✏️ Tárgy szerkesztése' : '➕ Új tárgy hozzáadása'}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <ItemForm
              item={editingItem}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-shell">
      <nav className="main-nav">
        <Link to="/">🏠 Főoldal</Link>
        <Link to="/alerts">🔔 Értesítések</Link>
        <Link to="/statistics">📊 Statisztikák</Link>
        <Link to="/qr-scanner">📷 QR Beolvasó</Link>
        <Link to="/settings">⚙️ Beállítások</Link>
      </nav>

      <Routes>
        <Route path="/" element={homeContent} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/qr-scanner" element={<QRScanner />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;
