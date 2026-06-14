import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const PaymentService = {
  createOrder: (data: any) => api.post('/payments/create-order', data),
  verifyPayment: (data: any) => api.post('/payments/verify', data),
  getTransactions: (params?: any) => api.get(endpoints.payments.transactions, params),
  getRefunds: (params?: any) => api.get(endpoints.payments.refunds, params)
};
