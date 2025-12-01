import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Image, MapPin, Calendar, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import '../styles/Alerts.css';

const Alerts = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'warning' | 'info'
  
  // Érintett tárgyak modal
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [modalItems, setModalItems] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('❌ Értesítések betöltési hiba:', error);
      toast.error('Értesítések betöltési hiba');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle className="icon warning" />;
      case 'NO_IMAGE':
        return <Image className="icon info" />;
      case 'NO_LOCATION':
        return <MapPin className="icon info" />;
      case 'OLD_PURCHASE':
        return <Calendar className="icon info" />;
      default:
        return <AlertTriangle className="icon" />;
    }
  };

  const getSeverityClass = (severity) => {
    return severity === 'warning' ? 'notification-warning' : 'notification-info';
  };

  const handleNotificationClick = async (notification) => {
    // Ha van item_id (egyetlen tárgy), navigálj a preview-ra
    if (notification.item_id) {
      console.log('🔔 Alert kattintás: item_id =', notification.item_id);
      navigate('/', { 
        state: { previewItemId: notification.item_id },
        replace: false
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Ha több tárgy érintett (count > 0), töltsd be a listát
    else if (notification.count && notification.type) {
      console.log('🔔 Alert kattintás: több tárgy, type =', notification.type);
      setLoadingItems(true);
      setModalTitle(notification.title);
      setShowItemsModal(true);
      
      try {
        const response = await api.get(`/notifications/${notification.type}/items`);
        setModalItems(response.data);
      } catch (error) {
        console.error('❌ Érintett tárgyak betöltési hiba:', error);
        toast.error('Nem sikerült betölteni az érintett tárgyakat');
        setShowItemsModal(false);
      } finally {
        setLoadingItems(false);
      }
    }
  };

  const handleItemClick = (itemId) => {
    setShowItemsModal(false);
    navigate('/', { 
      state: { previewItemId: itemId },
      replace: false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.severity === filter;
  });

  const warningCount = notifications.filter(n => n.severity === 'warning').length;
  const infoCount = notifications.filter(n => n.severity === 'info').length;

  if (loading) {
    return (
      <div className="alerts-container">
        <div className="alerts-header">
          <h1>🔔 Értesítések</h1>
        </div>
        <div className="loading">⏳ Értesítések betöltése...</div>
      </div>
    );
  }

  return (
    <div className="alerts-container">
      {/* Header */}
      <div className="alerts-header">
        <div className="header-left">
          <h1>🔔 Értesítések</h1>
          <p className="subtitle">Alacsony készlet és egyéb figyelmeztetések</p>
        </div>
        <button onClick={loadNotifications} className="refresh-btn">
          <RefreshCw size={18} />
          Frissítés
        </button>
      </div>

      {/* Stats Cards */}
      <div className="alerts-stats">
        <div className="stat-card warning">
          <AlertTriangle size={24} />
          <div className="stat-info">
            <div className="stat-value">{warningCount}</div>
            <div className="stat-label">Figyelmeztetés</div>
          </div>
        </div>
        <div className="stat-card info">
          <Image size={24} />
          <div className="stat-info">
            <div className="stat-value">{infoCount}</div>
            <div className="stat-label">Információ</div>
          </div>
        </div>
        <div className="stat-card total">
          <div className="stat-info">
            <div className="stat-value">{notifications.length}</div>
            <div className="stat-label">Összes értesítés</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="alerts-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Összes ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
          onClick={() => setFilter('warning')}
        >
          ⚠️ Figyelmeztetések ({warningCount})
        </button>
        <button
          className={`filter-btn ${filter === 'info' ? 'active' : ''}`}
          onClick={() => setFilter('info')}
        >
          ℹ️ Információk ({infoCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="alerts-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>Nincsenek értesítések!</h3>
            <p>
              {filter === 'all'
                ? 'Minden rendben van a leltárral.'
                : filter === 'warning'
                ? 'Nincsenek figyelmeztetések.'
                : 'Nincsenek információs értesítések.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${getSeverityClass(notification.severity)} ${
                (notification.item_id || notification.count) ? 'clickable' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                {notification.count && (
                  <div className="notification-meta">
                    <span className="meta-badge">{notification.count} tárgy érintett</span>
                  </div>
                )}
              </div>
              {(notification.item_id || notification.count) && (
                <button className="notification-action">
                  {notification.count ? 'Tárgyak megtekintése →' : 'Megnyitás →'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Érintett tárgyak modal */}
      {showItemsModal && (
        <div className="items-modal-overlay" onClick={() => setShowItemsModal(false)}>
          <div className="items-modal" onClick={(e) => e.stopPropagation()}>
            <div className="items-modal-header">
              <h2>{modalTitle}</h2>
              <button className="close-btn" onClick={() => setShowItemsModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="items-modal-content">
              {loadingItems ? (
                <div className="loading">⏳ Tárgyak betöltése...</div>
              ) : modalItems.length === 0 ? (
                <div className="empty-message">Nincsenek érintett tárgyak</div>
              ) : (
                <div className="items-list">
                  {modalItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="item-row"
                      onClick={() => handleItemClick(item.id)}
                    >
                      {item.image ? (
                        <img 
                          src={`/uploads/${item.image}`} 
                          alt={item.name}
                          className="item-thumb"
                        />
                      ) : (
                        <div className="item-thumb-placeholder">📦</div>
                      )}
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-category">{item.category}</div>
                      </div>
                      {item.purchase_price && (
                        <div className="item-price">
                          {item.purchase_price.toLocaleString()} Ft
                        </div>
                      )}
                      <div className="item-arrow">→</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
