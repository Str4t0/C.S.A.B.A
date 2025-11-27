/**
 * API Service - Backend kommunikáció
 * Frontend Developer: Sarah Kim
 */

import axios from 'axios';

// Dinamikus backend URL meghatározása
const getBackendURL = () => {
  // Ha production build (statikus fájlok), használd ugyanazt a host-ot
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // Fejlesztési módban
  const hostname = window.location.hostname;
  
  // Ha localhost, használd a localhost backend-et
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Egyébként (pl. 192.168.1.100) használd ugyanazt a hostname-et 8000-es porton
  return `http://${hostname}:8000`;
};

const BACKEND_URL = getBackendURL();
const API_BASE_URL = `${BACKEND_URL}/api`;

console.log('Backend URL:', BACKEND_URL); // Debug célból

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============= ITEMS API =============

export const itemsAPI = {
  // Összes item lekérése
  getAll: async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/items', { params });
    return response.data;
  },

  // Egy item lekérése
  getById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  // Keresés
  search: async (query) => {
    const response = await api.get('/items/search', { params: { q: query } });
    return response.data;
  },

  // Új item létrehozása
  create: async (itemData) => {
    const response = await api.post('/items', itemData);
    return response.data;
  },

  // Item frissítése
  update: async (id, itemData) => {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },

  // Item törlése
  delete: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },
};

// ============= IMAGES API =============

export const imagesAPI = {
  // Kép feltöltése
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Kép URL generálása - abszolút URL mobilhoz
  getImageUrl: (filename) => {
    return `${BACKEND_URL}/uploads/${filename}`;
  },

  // Thumbnail URL generálása - abszolút URL mobilhoz
  getThumbnailUrl: (filename) => {
    return `${BACKEND_URL}/uploads/thumbnails/thumb_${filename}`;
  },

  // Kép törlése
  delete: async (filename) => {
    const response = await api.delete(`/images/${filename}`);
    return response.data;
  },
};

// ============= CATEGORIES API =============

export const categoriesAPI = {
  // Összes kategória lekérése
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Új kategória létrehozása
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
};

// ============= STATISTICS API =============

export const statsAPI = {
  // Statisztikák lekérése
  get: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
};

// ============= USERS API =============

export const usersAPI = {
  // Összes user lekérése
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Egy user lekérése
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // User létrehozása
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // User frissítése
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // User tárgyai
  getItems: async (id) => {
    const response = await api.get(`/users/${id}/items`);
    return response.data;
  },

  // User statisztika
  getStats: async (id) => {
    const response = await api.get(`/users/${id}/stats`);
    return response.data;
  },
};

// ============= LOCATIONS API =============

export const locationsAPI = {
  // Összes helyszín lekérése
  getAll: async () => {
    const response = await api.get('/locations');
    return response.data;
  },

  // Gyökér helyszínek
  getRoots: async () => {
    const response = await api.get('/locations/roots');
    return response.data;
  },

  // Egy helyszín lekérése
  getById: async (id) => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  // Helyszín gyerekei
  getChildren: async (id) => {
    const response = await api.get(`/locations/${id}/children`);
    return response.data;
  },

  // Helyszín létrehozása
  create: async (locationData) => {
    const response = await api.post('/locations', locationData);
    return response.data;
  },

  // Helyszín frissítése
  update: async (id, locationData) => {
    const response = await api.put(`/locations/${id}`, locationData);
    return response.data;
  },

  // Helyszín törlése
  delete: async (id) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },

  // Helyszín tárgyai
  getItems: async (id, includeChildren = false) => {
    const response = await api.get(`/locations/${id}/items`, {
      params: { include_children: includeChildren }
    });
    return response.data;
  },
};

// ============= QR CODES API =============

export const qrAPI = {
  // QR kód generálás
  generate: async (itemId, size = 'medium') => {
    const response = await api.post(`/qr/generate/${itemId}`, null, {
      params: { size }
    });
    return response.data;
  },

  // QR címke letöltési URL
  getDownloadUrl: (itemId, size = 'medium') => {
    return `${BACKEND_URL}/api/qr/download/${itemId}/${size}`;
  },

  // QR kód beolvasás
  scan: async (qrCode) => {
    const response = await api.get(`/qr/scan/${qrCode}`);
    return response.data;
  },

  // QR kód törlése
  delete: async (itemId) => {
    const response = await api.delete(`/qr/${itemId}/qr`);
    return response.data;
  },

  // Low stock items
  getLowStock: async () => {
    const response = await api.get('/qr/low-stock');
    return response.data;
  },
};

// ============= DOCUMENTS API =============

export const documentsAPI = {
  // Dokumentum feltöltése
  upload: async (itemId, file, documentType = null, description = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (documentType) formData.append('document_type', documentType);
    if (description) formData.append('description', description);

    const response = await api.post(`/items/${itemId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Item dokumentumai
  getByItem: async (itemId) => {
    const response = await api.get(`/items/${itemId}/documents`);
    return response.data;
  },

  // Egy dokumentum lekérése
  getById: async (documentId) => {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  },

  // Dokumentum letöltési URL
  getDownloadUrl: (documentId) => {
    return `${BACKEND_URL}/api/documents/${documentId}/download`;
  },

  // Dokumentum frissítése
  update: async (documentId, documentType = null, description = null) => {
    const response = await api.put(`/documents/${documentId}`, {
      document_type: documentType,
      description: description
    });
    return response.data;
  },

  // Dokumentum törlése
  delete: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },
};

// Backward compatibility
export default {
  // Items
  getItems: itemsAPI.getAll,
  getItem: itemsAPI.getById,
  searchItems: itemsAPI.search,
  createItem: itemsAPI.create,
  updateItem: itemsAPI.update,
  deleteItem: itemsAPI.delete,
  
  // Categories
  getCategories: categoriesAPI.getAll,
  createCategory: categoriesAPI.create,
  
  // Stats
  getStats: statsAPI.get,
  getGlobalStats: statsAPI.get, 
  
  // Images
  uploadImage: imagesAPI.upload,
  getImageUrl: imagesAPI.getImageUrl,
  getThumbnailUrl: imagesAPI.getThumbnailUrl,
  deleteImage: imagesAPI.delete,

  // Users
  getUsers: usersAPI.getAll,
  getUser: usersAPI.getById,
  createUser: usersAPI.create,
  updateUser: usersAPI.update,
  getUserItems: usersAPI.getItems,
  getUserStats: usersAPI.getStats,

  // Locations
  getLocations: locationsAPI.getAll,
  getRootLocations: locationsAPI.getRoots,
  getLocation: locationsAPI.getById,
  getLocationChildren: locationsAPI.getChildren,
  createLocation: locationsAPI.create,
  updateLocation: locationsAPI.update,
  deleteLocation: locationsAPI.delete,
  getLocationItems: locationsAPI.getItems,

  // QR Codes
  generateQR: qrAPI.generate,
  getQRDownloadUrl: qrAPI.getDownloadUrl,
  scanQR: qrAPI.scan,
  deleteQR: qrAPI.delete,
  getLowStockItems: qrAPI.getLowStock,

  // Documents
  uploadDocument: documentsAPI.upload,
  getDocuments: documentsAPI.getByItem,
  getDocument: documentsAPI.getById,
  getDocumentDownloadUrl: documentsAPI.getDownloadUrl,
  updateDocument: documentsAPI.update,
  deleteDocument: documentsAPI.delete,
};
