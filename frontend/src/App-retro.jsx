/**
 * App.jsx - RETRO SKETCH EDITION
 * Frontend Developer: Sarah Kim
 * Design: Vintage hand-drawn style
 */

import React, { useState, useEffect } from 'react';
import ItemForm from './components/ItemForm';
import ItemCard from './components/ItemCard';
import QuickActions from './components/QuickActions';
import LowStockAlert from './components/LowStockAlert';
import api from './services/api';
import './styles/main.css';
import './styles/retro-sketch.css';

function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData, statsData] = await Promise.all([
        api.getItems(),
        api.getCategories(),
        api.getStats()
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Adatok betöltési hiba:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      const results = await api.searchItems(searchQuery);
      setItems(results);
    } catch (error) {
      console.error('Keresési hiba:', error);
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    
    if (!category) {
      loadData();
      return;
    }

    try {
      const filtered = await api.getItems(category);
      setItems(filtered);
    } catch (error) {
      console.error('Szűrési hiba:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedItem) {
        await api.updateItem(selectedItem.id, formData);
      } else {
        await api.createItem(formData);
      }
      setShowForm(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      console.error('Mentési hiba:', error);
      alert('Hiba történt a mentés során!');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a tárgyat?')) {
      return;
    }

    try {
      await api.deleteItem(id);
      loadData();
    } catch (error) {
      console.error('Törlési hiba:', error);
      alert('Hiba történt a törlés során!');
    }
  };

  const handleQRScan = async (qrCode) => {
    try {
      const result = await api.scanQR(qrCode);
      const item = await api.getItem(result.item_id);
      setSelectedItem(item);
      setShowForm(true);
    } catch (error) {
      alert('❌ Nincs tárgy ezzel a QR kóddal!');
    }
  };

  const handleLowStockItemClick = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleNewItem = () => {
    setSelectedItem(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="loading-sketch">
        <div className="spinner-sketch">⏳</div>
        <p className="subtitle-sketch">Betöltés...</p>
      </div>
    );
  }

  return (
    <div className="app-sketch">
      {/* Header */}
      <header className="header-sketch paper-card">
        <div className="header-content">
          <div className="title-section">
            <h1 className="title-sketch">
              📦 Inventory Manager
            </h1>
            <p className="subtitle-sketch">
              ✏️ Otthoni tárgyi nyilvántartó ✏️
            </p>
          </div>

          {/* Stats badges */}
          {stats && (
            <div className="stats-badges-sketch">
              <div className="badge-sketch badge-sketch-orange">
                📦 {stats.total_items} tárgy
              </div>
              <div className="badge-sketch badge-sketch-green">
                💰 {stats.total_value.toLocaleString()} Ft
              </div>
              {stats.low_stock_items > 0 && (
                <div className="badge-sketch" style={{background: '#f39c12', color: 'white'}}>
                  ⚠️ {stats.low_stock_items} alacsony
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Search & Filter */}
      <div className="search-section-sketch paper-card">
        <div className="search-container-sketch">
          <input
            type="text"
            className="input-sketch search-input-sketch"
            placeholder="🔍 Keresés a tárgyak között..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="btn-sketch btn-sketch-primary"
            onClick={handleSearch}
          >
            Keresés
          </button>
        </div>

        {/* Category tabs */}
        <div className="tabs-sketch">
          <button
            className={`tab-sketch ${!selectedCategory ? 'active' : ''}`}
            onClick={() => handleCategoryFilter('')}
          >
            📋 Összes
          </button>
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat.name}
              className={`tab-sketch ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(cat.name)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid or Form */}
      {showForm ? (
        <div className="form-container-sketch paper-card">
          <div className="form-header-sketch">
            <h2 className="heading-sketch">
              {selectedItem ? '✏️ Tárgy szerkesztése' : '➕ Új tárgy hozzáadása'}
            </h2>
          </div>
          <ItemForm
            item={selectedItem}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedItem(null);
            }}
          />
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <div className="empty-state-sketch paper-card text-center-sketch">
              <div className="icon-sketch float-sketch" style={{margin: '20px auto'}}>
                📭
              </div>
              <h3 className="heading-sketch">Még nincs tárgy</h3>
              <p className="subtitle-sketch">
                Klikkelj a ➕ gombra új tárgy hozzáadásához!
              </p>
            </div>
          ) : (
            <div className="items-grid-sketch">
              {items.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Floating Actions */}
      <QuickActions
        onScanResult={handleQRScan}
        onNewItem={handleNewItem}
      />

      {/* Low Stock Alert */}
      <LowStockAlert
        onItemClick={handleLowStockItemClick}
      />

      <style jsx>{`
        .app-sketch {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .loading-sketch {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .spinner-sketch {
          font-size: 64px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .header-sketch {
          margin-bottom: 25px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .title-section {
          flex: 1;
        }

        .stats-badges-sketch {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .search-section-sketch {
          margin-bottom: 25px;
        }

        .search-container-sketch {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .search-input-sketch {
          flex: 1;
        }

        .form-container-sketch {
          margin-bottom: 25px;
        }

        .form-header-sketch {
          border-bottom: 3px solid var(--ink-dark);
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .items-grid-sketch {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .empty-state-sketch {
          padding: 60px 20px;
        }

        @media (max-width: 768px) {
          .app-sketch {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .search-container-sketch {
            flex-direction: column;
          }

          .tabs-sketch {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .items-grid-sketch {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
