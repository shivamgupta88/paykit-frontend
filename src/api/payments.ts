import { apiClient } from './client'

export const paymentsApi = {
  initiate: (invoiceId: string) =>
    apiClient.post('/api/payments/initiate', { invoiceId }),

  verify: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    apiClient.post('/api/payments/verify', data),

  getById: (id: string) =>
    apiClient.get(`/api/payments/${id}`),

  listByInvoice: (invoiceId: string) =>
    apiClient.get(`/api/payments/invoice/${invoiceId}`),
}
