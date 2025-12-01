/**
 * App komponens - Fő alkalmazás (Retro UI)
 * Frontend Developer: Sarah Kim
 * JAVÍTVA: Preview modal és egyéb funkciók hozzáadása (mint Game UI-ban)
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { itemsAPI, categoriesAPI, statsAPI, imagesAPI, documentsAPI } from './services/api';
import ItemCard from './components/ItemCard';
import ItemForm from './components/ItemForm';
import './styles/main.css';
import Alerts from './components/Alerts';
import Statistics from './components/Statistics';
import QRScanner from './components/QRScanner';
import Settings from './components/Settings';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  // JAVÍTVA: Preview modal state (mint Game UI-ban)
  const [previewItem, setPreviewItem] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Kezdeti adatok betöltése
  useEffect(() => {
    loadData();
  }, []);

  // Alert-ből/Statisztikákból érkező item preview
  useEffect(() => {
    const previewItemId = location.state?.previewItemId;
    const editItemId = location.state?.editItemId;
    
    if (previewItemId) {
      console.log('👁️ Preview navigáció (Retro): previewItemId =', previewItemId);
      const itemToPreview = items.find(item => item.id === previewItemId);
      if (itemToPreview) {
        setPreviewItem(itemToPreview);
        setPreviewIndex(0);
        navigate('/', { replace: true, state: null });
      } else if (!loading) {
        itemsAPI.getById(previewItemId)
          .then((item) => {
            setPreviewItem(item);
            setPreviewIndex(0);
            navigate('/', { replace: true, state: null });
          })
          .catch(() => {
            navigate('/', { replace: true, state: null });
          });
      }
    } else if (editItemId) {
      const itemToEdit = items.find(item => item.id === editItemId);
      if (itemToEdit) {
        handleEditItem(itemToEdit);
        navigate('/', { replace: true, state: null });
      } else if (!loading) {
        itemsAPI.getById(editItemId)
          .then((item) => {
            handleEditItem(item);
            navigate('/', { replace: true, state: null });
          })
          .catch(() => {
            navigate('/', { replace: true, state: null });
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, items.length, loading]);

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
            {/* JAVÍTVA: Klikkelhetős stat kártyák + auto scroll */}
            <div 
              className="stat-item clickable" 
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ cursor: 'pointer' }}
              title="Ugrás a tárgyak listájához"
            >
              <div className="stat-value">{stats.total_items || 0}</div>
              <div className="stat-label">Tárgy</div>
            </div>
            <div 
              className="stat-item clickable" 
              onClick={() => {
                navigate('/statistics');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ cursor: 'pointer' }}
              title="Ugrás a statisztikákhoz"
            >
              <div className="stat-value">
                {stats.total_value ? `${(stats.total_value / 1000).toFixed(0)}k` : '0'}
              </div>
              <div className="stat-label">Érték (Ft)</div>
            </div>
            <div 
              className="stat-item clickable" 
              onClick={() => {
                navigate('/alerts');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ cursor: 'pointer' }}
              title="Ugrás az értesítésekhez"
            >
              <div className="stat-value">
                {stats.low_stock_count || 0}
              </div>
              <div className="stat-label">Alacsony készlet</div>
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
                onPreview={(chosen, startIndex = 0) => {
                  setPreviewIndex(startIndex);
                  setPreviewItem(chosen);
                }}
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

      {/* Edit Modal */}
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

      {/* JAVÍTVA: Preview Modal (mint Game UI-ban) */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => { setPreviewItem(null); setPreviewIndex(0); }}>
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '900px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h2 className="modal-title">👁️ {previewItem.name}</h2>
              <button className="close-btn" onClick={() => { setPreviewItem(null); setPreviewIndex(0); }}>
                ✕
              </button>
            </div>
            <div style={{ 
              padding: '20px', 
              overflowY: 'auto',
              flex: 1,
              minHeight: 0
            }}>
              {/* Képgaléria */}
              {(() => {
                const gallery = (previewItem.images && previewItem.images.length > 0
                  ? previewItem.images
                  : (previewItem.image_filename ? [{ filename: previewItem.image_filename, orientation: null }] : [])
                );
                const active = gallery[previewIndex] || gallery[0];

                return (
                  <>
                    {active && (
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img 
                          src={imagesAPI.getImageUrl(active.filename)} 
                          alt={previewItem.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            border: '2px solid var(--border-color)'
                          }}
                        />
                        {gallery.length > 1 && (
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            gap: '15px',
                            marginTop: '10px'
                          }}>
                            <button 
                              className="icon-btn"
                              onClick={() => setPreviewIndex((previewIndex - 1 + gallery.length) % gallery.length)}
                            >
                              ◀
                            </button>
                            <span>{previewIndex + 1} / {gallery.length}</span>
                            <button 
                              className="icon-btn"
                              onClick={() => setPreviewIndex((previewIndex + 1) % gallery.length)}
                            >
                              ▶
                            </button>
                          </div>
                        )}
                        {/* Thumbnail sor */}
                        {gallery.length > 1 && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            justifyContent: 'center',
                            marginTop: '10px',
                            flexWrap: 'wrap'
                          }}>
                            {gallery.map((img, idx) => (
                              <button
                                key={img.filename}
                                onClick={() => setPreviewIndex(idx)}
                                style={{
                                  padding: '2px',
                                  border: idx === previewIndex ? '2px solid var(--primary-color)' : '2px solid transparent',
                                  borderRadius: '4px',
                                  background: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <img 
                                  src={imagesAPI.getThumbnailUrl(img.filename)} 
                                  alt=""
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Tárgy adatok */}
              <div style={{ display: 'grid', gap: '10px' }}>
                <div><strong>📂 Kategória:</strong> {previewItem.category}</div>
                {previewItem.purchase_price && (
                  <div><strong>💰 Ár:</strong> {previewItem.purchase_price.toLocaleString()} Ft</div>
                )}
                {previewItem.location?.full_path && (
                  <div><strong>📍 Hely:</strong> {previewItem.location.full_path}</div>
                )}
                {previewItem.quantity && (
                  <div><strong>📦 Mennyiség:</strong> {previewItem.quantity} db</div>
                )}
                {previewItem.purchase_date && (
                  <div><strong>📅 Vásárlás:</strong> {new Date(previewItem.purchase_date).toLocaleDateString('hu-HU')}</div>
                )}
                {previewItem.warranty_until && (
                  <div><strong>🛡️ Garancia:</strong> {new Date(previewItem.warranty_until).toLocaleDateString('hu-HU')}</div>
                )}
                {previewItem.description && (
                  <div><strong>📝 Leírás:</strong> {previewItem.description}</div>
                )}

                {/* Dokumentumok */}
                {previewItem.documents?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>📄 Dokumentumok:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                      {previewItem.documents.map(doc => (
                        <a
                          key={doc.id}
                          href={documentsAPI.getDownloadUrl(doc.id)}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '5px 10px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                          }}
                        >
                          📎 {doc.original_filename || doc.filename}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Footer gombok */}
            <div style={{ 
              padding: '15px 20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              flexShrink: 0
            }}>
              <button 
                className="add-button"
                onClick={() => { 
                  setPreviewItem(null); 
                  handleEditItem(previewItem); 
                }}
              >
                ✏️ Szerkesztés
              </button>
              <button 
                className="category-btn"
                onClick={() => setPreviewItem(null)}
              >
                Bezár
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-shell">
      <nav className="main-nav">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>🏠 Főoldal</Link>
        <Link to="/alerts" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>🔔 Értesítések</Link>
        <Link to="/statistics" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>📊 Statisztikák</Link>
        <Link to="/qr-scanner" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>📷 QR Beolvasó</Link>
        <Link to="/settings" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>⚙️ Beállítások</Link>
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
