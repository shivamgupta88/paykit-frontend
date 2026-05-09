import { apiClient } from './client'

export const authApi = {
  register: (data: { tenantId: string; email: string; password: string; fullName: string }) =>
    apiClient.post('/api/auth/register', data),

  login: (data: { tenantId: string; email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),

  createTenant: (data: { name: string; slug: string; contactEmail: string }) =>
    apiClient.post('/api/tenants', data),

  getTenantBySlug: (slug: string) =>
    apiClient.get(`/api/tenants/${slug}`),
}
