import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });

export const getInsights = () => api.get('/insights');
export const getInventory = () => api.get('/inventory');
export const upsertInventory = (data) => api.post('/inventory', data);
export const updateInventoryQty = (id, quantity) => api.patch(`/inventory/${id}`, { quantity });
export const deleteInventory = (id) => api.delete(`/inventory/${id}`);

export const getWorkers = () => api.get('/workers');
export const createWorker = (data) => api.post('/workers', data);
export const updateWorker = (id, data) => api.patch(`/workers/${id}`, data);
export const deleteWorker = (id) => api.delete(`/workers/${id}`);

export const getOrders = () => api.get('/orders');
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

export const sendSMS = (data) => api.post('/sms/send', data);
export const getAlerts = () => api.get('/sms');

export const sendAirtime = (data) => api.post('/airtime/send', data);
export const getAirtimeLogs = () => api.get('/airtime/logs');
