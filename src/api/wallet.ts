import { apiClient } from './client'

export type AccountType = 'BANK' | 'UPI'
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'

export interface WalletBalance {
  balance: number
  totalEarned: number
  totalWithdrawn: number
}

export interface PayoutResponse {
  id: string
  amount: number
  accountType: AccountType
  accountHolderName?: string
  accountNumber?: string
  ifscCode?: string
  upiId?: string
  status: PayoutStatus
  failureReason?: string
  createdAt: string
}

export interface WithdrawRequest {
  amount: number
  accountType: AccountType
  accountHolderName?: string
  accountNumber?: string
  ifscCode?: string
  upiId?: string
}

export const walletApi = {
  getBalance: () =>
    apiClient.get<WalletBalance>('/api/wallet/balance'),

  withdraw: (data: WithdrawRequest) =>
    apiClient.post<PayoutResponse>('/api/wallet/withdraw', data),

  listPayouts: (page = 0, size = 20) =>
    apiClient.get('/api/wallet/payouts', { params: { page, size } }),
}
