import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getSummary = () => api.get('/summary').then(r => r.data)
export const getInvestments = (category) =>
  api.get('/investments', { params: category ? { category } : {} }).then(r => r.data)
export const createInvestment = (data) => api.post('/investments', data).then(r => r.data)
export const updateInvestment = (id, data) => api.patch(`/investments/${id}`, data).then(r => r.data)
export const deleteInvestment = (id) => api.delete(`/investments/${id}`).then(r => r.data)

export const getTransfers = () => api.get('/transfers').then(r => r.data)
export const createTransfer = (data) => api.post('/transfers', data).then(r => r.data)
export const updateTransfer = (id, data) => api.patch(`/transfers/${id}`, data).then(r => r.data)
export const deleteTransfer = (id) => api.delete(`/transfers/${id}`).then(r => r.data)

export const updateMeta = (key, value) => api.patch(`/meta/${key}`, { value }).then(r => r.data)
