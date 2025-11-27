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

  const handleNotificationClick = (notification) => {
    // Ha van item_id, navigálj a tárgyhoz
    if (notification.item_id) {
      navigate(`/items/${notification.item_id}`);
    }
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
                notification.item_id ? 'clickable' : ''
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
              {notification.item_id && (
                <button className="notification-action">
                  Megnyitás →
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
