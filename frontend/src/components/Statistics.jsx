import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Package, DollarSign, AlertTriangle, Image as ImageIcon,
  TrendingUp, Users, MapPin, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api, { itemsAPI } from '../services/api';
import { useUI } from '../contexts/UIContext';
import ItemPreviewGameUI from './ItemPreview-game-ui';
import ItemPreviewRetro from './ItemPreview-retro';
import '../styles/Statistics.css';

const Statistics = () => {
  const { isGameUI } = useUI();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    loadStats();
    loadAllItems();
  }, []);
  
  const loadAllItems = async () => {
    try {
      const data = await itemsAPI.getAll();
      setAllItems(data || []);
    } catch (error) {
      console.error('Items betöltési hiba:', error);
    }
  };
  
  const handleItemClick = async (itemId) => {
    const item = allItems.find(i => i.id === itemId);
    if (item) {
      setPreviewItem(item);
    } else {
      try {
        const data = await itemsAPI.getById(itemId);
        setPreviewItem(data);
      } catch (error) {
        toast.error('Tárgy nem található');
      }
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stats/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('❌ Statisztikák betöltési hiba:', error);
      toast.error('Statisztikák betöltési hiba');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading || !stats) {
    return (
      <div className="stats-container">
        <div className="loading">⏳ Statisztikák betöltése...</div>
      </div>
    );
  }

  const { overview, by_category, by_user, by_location, monthly_purchases, top_items, completion } = stats;

  // Top 3 kategória értékben
  const topCategories = Object.entries(by_category.values || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="stats-container">
      {/* Header */}
      <div className="stats-header">
        <h1>📊 Statisztikák</h1>
        <p className="subtitle">Részletes áttekintés a leltárról</p>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Package size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Összes tárgy</div>
            <div className="stat-value">{overview.total_items}</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <DollarSign size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Összes érték</div>
            <div className="stat-value">{formatCurrency(overview.total_value)}</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <AlertTriangle size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Alacsony készlet</div>
            <div className="stat-value">{overview.low_stock_count}</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <ImageIcon size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Képekkel</div>
            <div className="stat-value">{overview.items_with_image}</div>
            <div className="stat-subtext">{completion.with_image}%</div>
          </div>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="completion-section">
        <h2>📈 Adatok teljessége</h2>
        <div className="completion-bars">
          <div className="completion-item">
            <div className="completion-header">
              <span className="completion-label">📸 Képpel rendelkezik</span>
              <span className="completion-percent">{completion.with_image}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill success" 
                style={{ width: `${completion.with_image}%` }}
              ></div>
            </div>
          </div>

          <div className="completion-item">
            <div className="completion-header">
              <span className="completion-label">🔲 QR kóddal rendelkezik</span>
              <span className="completion-percent">{completion.with_qr}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill primary" 
                style={{ width: `${completion.with_qr}%` }}
              ></div>
            </div>
          </div>

          <div className="completion-item">
            <div className="completion-header">
              <span className="completion-label">📍 Helyszínnel rendelkezik</span>
              <span className="completion-percent">{completion.with_location}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill info" 
                style={{ width: `${completion.with_location}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="stats-two-column">
        {/* Top Items - KATTINTHATÓ */}
        <div className="stats-section">
          <h2>💎 Top 5 legértékesebb tárgy</h2>
          <div className="top-items-list">
            {top_items.length === 0 ? (
              <div className="empty-message">Nincs ár információ megadva</div>
            ) : (
              top_items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="top-item-card clickable"
                  onClick={() => handleItemClick(item.id)}
                  style={{ cursor: 'pointer' }}
                  title="Kattints a tárgy megtekintéséhez"
                >
                  <div className="item-rank">#{index + 1}</div>
                  {item.image && (
                    <img 
                      src={`/uploads/${item.image}`} 
                      alt={item.name}
                      className="item-thumb"
                    />
                  )}
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-category">{item.category}</div>
                  </div>
                  <div className="item-price">{formatCurrency(item.price)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="stats-section">
          <h2>📦 Top 3 kategória értékben</h2>
          <div className="category-list">
            {topCategories.length === 0 ? (
              <div className="empty-message">Nincs adat</div>
            ) : (
              topCategories.map(([category, value], index) => {
                const itemCount = by_category.items[category] || 0;
                const maxValue = topCategories[0][1];
                const percentage = (value / maxValue) * 100;
                
                return (
                  <div key={category} className="category-item">
                    <div className="category-header">
                      <span className="category-rank">#{index + 1}</span>
                      <span className="category-name">{category}</span>
                      <span className="category-count">{itemCount} db</span>
                    </div>
                    <div className="category-value">{formatCurrency(value)}</div>
                    <div className="category-bar">
                      <div 
                        className="category-bar-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Users & Locations */}
      <div className="stats-two-column">
        {/* By User */}
        <div className="stats-section">
          <h2><Users size={20} /> Felhasználók szerint</h2>
          <div className="simple-list">
            {Object.entries(by_user).length === 0 ? (
              <div className="empty-message">Nincs adat</div>
            ) : (
              Object.entries(by_user)
                .sort(([,a], [,b]) => b - a)
                .map(([user, count]) => (
                  <div key={user} className="simple-item">
                    <span className="item-label">{user}</span>
                    <span className="item-value">{count} db</span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* By Location */}
        <div className="stats-section">
          <h2><MapPin size={20} /> Helyszínek szerint</h2>
          <div className="simple-list">
            {Object.entries(by_location).length === 0 ? (
              <div className="empty-message">Nincs adat</div>
            ) : (
              Object.entries(by_location)
                .sort(([,a], [,b]) => b - a)
                .map(([location, count]) => (
                  <div key={location} className="simple-item">
                    <span className="item-label">{location}</span>
                    <span className="item-value">{count} db</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Purchases */}
      <div className="stats-section full-width">
        <h2><Calendar size={20} /> Havi vásárlások (utolsó 12 hónap)</h2>
        <div className="monthly-chart">
          {Object.entries(monthly_purchases).length === 0 ? (
            <div className="empty-message">Nincs vásárlási adat</div>
          ) : (
            Object.entries(monthly_purchases)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-12)
              .map(([month, count]) => {
                const maxCount = Math.max(...Object.values(monthly_purchases));
                const height = (count / maxCount) * 100;
                
                return (
                  <div key={month} className="monthly-bar-wrapper">
                    <div className="monthly-bar" style={{ height: `${Math.max(height, 10)}%` }}>
                      <div className="bar-value">{count}</div>
                    </div>
                    <div className="monthly-label">{month}</div>
                  </div>
                );
              })
          )}
        </div>
      </div>
      
      {/* Tárgy előnézet modal - UI-nak megfelelő */}
      {previewItem && isGameUI && (
        <ItemPreviewGameUI
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onEdit={() => {
            setPreviewItem(null);
            window.location.href = `/?edit=${previewItem.id}`;
          }}
        />
      )}
      
      {previewItem && !isGameUI && (
        <ItemPreviewRetro
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onEdit={() => {
            setPreviewItem(null);
            window.location.href = `/?edit=${previewItem.id}`;
          }}
        />
      )}
    </div>
  );
};

export default Statistics;
