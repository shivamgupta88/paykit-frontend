import { apiClient } from './client'

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export const invoicesApi = {
  list: (status?: InvoiceStatus, page = 0, size = 10) =>
    apiClient.get('/api/invoices', { params: { status, page, size } }),

  getById: (id: string) =>
    apiClient.get(`/api/invoices/${id}`),

  create: (data: {
    customerId: string
    issueDate: string
    dueDate: string
    currency: string
    notes?: string
    items: { description: string; quantity: number; unitPrice: number; taxRate: number }[]
  }) => apiClient.post('/api/invoices', data),

  updateStatus: (id: string, status: InvoiceStatus) =>
    apiClient.patch(`/api/invoices/${id}/status`, { status }),

  downloadPdf: (id: string) =>
    apiClient.get(`/api/invoices/${id}/pdf`, { responseType: 'blob' }),
}
