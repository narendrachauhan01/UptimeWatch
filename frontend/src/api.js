import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const api = axios.create({ baseURL: `${BASE_URL}/api` });
export const API_URL = BASE_URL;

export const getServers = () => api.get('/servers');
export const addServer = (data) => api.post('/servers', data);
export const updateServer = (id, data) => api.put(`/servers/${id}`, data);
export const deleteServer = (id) => api.delete(`/servers/${id}`);
export const checkNow = () => api.post('/servers/check-now');

export const getRecipients = () => api.get('/recipients');
export const addRecipient = (data) => api.post('/recipients', data);
export const updateRecipient = (id, data) => api.put(`/recipients/${id}`, data);
export const deleteRecipient = (id) => api.delete(`/recipients/${id}`);

export const getAlerts = () => api.get('/alerts');
export const getWaStatus = () => api.get('/whatsapp/status');
