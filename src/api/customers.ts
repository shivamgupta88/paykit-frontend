import { apiClient } from './client'

export const customersApi = {
  list: (page = 0, size = 10) =>
    apiClient.get('/api/customers', { params: { page, size } }),

  getById: (id: string) =>
    apiClient.get(`/api/customers/${id}`),

  create: (data: { name: string; email: string; phone?: string; billingAddress?: string; gstin?: string }) =>
    apiClient.post('/api/customers', data),

  update: (id: string, data: { name: string; email: string; phone?: string; billingAddress?: string; gstin?: string }) =>
    apiClient.put(`/api/customers/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/customers/${id}`),
}
