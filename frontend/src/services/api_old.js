/**
 * API Service - Axios konfiguráció
 * Frontend Developer: Sarah Kim
 */

import axios from 'axios';

// API base URL - módosítsd ha szükséges
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Axios instance létrehozása
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - token hozzáadása ha van
api.interceptors.request.use(
  (config) => {
    // Ha van token, add hozzá a headerhez
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hibakezelés
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Szerver válasz hiba
      console.error('API Error:', error.response.data);
      
      // 401 Unauthorized - logout
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Nincs válasz a szervertől
      console.error('Network Error:', error.request);
    } else {
      // Egyéb hiba
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============= ITEMS API =============

export const itemsAPI = {
  // Összes tárgy lekérése
  getAll: async (category = null) => {
    try {
      const url = category ? `/items?category=${category}` : '/items';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Items fetch error:', error);
      throw error;
    }
  },

  // Egy tárgy lekérése ID alapján
  getById: async (id) => {
    try {
      const response = await api.get(`/items/${id}`);
      return response.data;
    } catch (error) {
      console.error('Item fetch error:', error);
      throw error;
    }
  },

  // Tárgy keresése
  search: async (query) => {
    try {
      const response = await api.get(`/items/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  // Új tárgy létrehozása
  create: async (itemData) => {
    try {
      const response = await api.post('/items', itemData);
      return response.data;
    } catch (error) {
      console.error('Item create error:', error);
      throw error;
    }
  },

  // Tárgy frissítése
  update: async (id, itemData) => {
    try {
      const response = await api.put(`/items/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error('Item update error:', error);
      throw error;
    }
  },

  // Tárgy törlése
  delete: async (id) => {
    try {
      const response = await api.delete(`/items/${id}`);
      return response.data;
    } catch (error) {
      console.error('Item delete error:', error);
      throw error;
    }
  }
};

// ============= CATEGORIES API =============

export const categoriesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Categories fetch error:', error);
      return [];
    }
  }
};

// ============= USERS API =============

export const usersAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Users fetch error:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('User fetch error:', error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('User create error:', error);
      throw error;
    }
  },

  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('User stats error:', error);
      throw error;
    }
  }
};

// ============= LOCATIONS API =============

export const locationsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      console.error('Locations fetch error:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Location fetch error:', error);
      throw error;
    }
  },

  create: async (locationData) => {
    try {
      const response = await api.post('/locations', locationData);
      return response.data;
    } catch (error) {
      console.error('Location create error:', error);
      throw error;
    }
  }
};

// ============= STATS API =============

export const statsAPI = {
  get: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Stats fetch error:', error);
      return {
        total_items: 0,
        total_categories: 0,
        total_value: 0
      };
    }
  },

  getDashboard: async () => {
    try {
      const response = await api.get('/stats/dashboard');
      return response.data;
    } catch (error) {
      console.error('Dashboard stats fetch error:', error);
      throw error;
    }
  }
};

// ============= NOTIFICATIONS API =============

export const notificationsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Notifications fetch error:', error);
      return [];
    }
  }
};

// ============= QR API =============

export const qrAPI = {
  generate: async (itemId, size = 'medium') => {
    try {
      const response = await api.post(`/qr/generate/${itemId}?size=${size}`);
      return response.data;
    } catch (error) {
      console.error('QR generate error:', error);
      throw error;
    }
  },

  scan: async (qrCode) => {
    try {
      const response = await api.get(`/qr/scan/${qrCode}`);
      return response.data;
    } catch (error) {
      console.error('QR scan error:', error);
      throw error;
    }
  },

  getLowStock: async () => {
    try {
      const response = await api.get('/qr/low-stock');
      return response.data;
    } catch (error) {
      console.error('Low stock fetch error:', error);
      return [];
    }
  }
};

// ============= UPLOAD API =============

export const uploadAPI = {
  image: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },

  document: async (itemId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/items/${itemId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }
};

// ============= IMAGES API =============

export const imagesAPI = {
  // Kép URL generálás
  getImageUrl: (filename) => {
    if (!filename) return null;
    // API_BASE_URL-ből kivonjuk az /api részt
    const baseURL = API_BASE_URL.replace('/api', '');
    return `${baseURL}/uploads/${filename}`;
  },

  // Thumbnail URL generálás
  getThumbnailUrl: (filename) => {
    if (!filename) return null;
    // API_BASE_URL-ből kivonjuk az /api részt
    const baseURL = API_BASE_URL.replace('/api', '');
    return `${baseURL}/uploads/thumbnails/thumb_${filename}`;
  },

  // Kép feltöltés
  upload: async (file) => {
    return uploadAPI.image(file);
  }
};

// ============= DOCUMENTS API =============

export const documentsAPI = {
  // Dokumentum feltöltés
  upload: async (itemId, file) => {
    return uploadAPI.document(itemId, file);
  },

  // Dokumentum URL generálás
  getDocumentUrl: (filename) => {
    if (!filename) return null;
    const baseURL = API_BASE_URL.replace('/api', '');
    return `${baseURL}/documents/${filename}`;
  },

  // Dokumentum letöltés URL
  getDownloadUrl: (documentId) => {
    if (!documentId) return null;
    return `${API_BASE_URL}/documents/${documentId}/download`;
  },

  // Tárgy dokumentumainak lekérése
  getByItemId: async (itemId) => {
    try {
      const response = await api.get(`/items/${itemId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Documents fetch error:', error);
      return [];
    }
  },

  // Dokumentum törlése
  delete: async (documentId) => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Document delete error:', error);
      throw error;
    }
  }
};

// Export default
export default api;
