/**
 * SAFAR Chain — API Service
 * All functions call the real Express.js backend.
 * No mock data — every return value comes from the server.
 */

import axios from 'axios';
import { getAuthSnapshot } from '@/store/authStore';
import type {
  CreateDrugSaleResponse,
  CreateOrderResponse,
  CreatePrescriptionResponse,
  ConfirmPrescriptionResponse,
  CertifyLotResponse,
  CreateProductResponse,
  DrugSaleResponse,
  EligibilityResponse,
  OrderResponse,
  PublishableLotResponse,
  PrescriptionResponse,
  ProductResponse,
  TraceResponse,
  VetAssistantResponse,
} from '@/services/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
});

// Inject Bearer token on every request
apiClient.interceptors.request.use((config) => {
  const { token } = getAuthSnapshot();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap { success, data, error } envelope
function unwrap<T>(res: { data: { success: boolean; data: T; error: any } }): T {
  if (!res.data.success) {
    const msg = res.data.error?.message || 'Unknown API error';
    const code = res.data.error?.code || 'API_ERROR';
    const err = new Error(msg) as any;
    err.code = code;
    throw err;
  }
  return res.data.data;
}

/* ═══════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════ */

// Auth is handled directly in authStore.ts via axios.post

/* ═══════════════════════════════════════════════════
   DRUG SALES (Pharmacy)
   ═══════════════════════════════════════════════════ */

export async function getRecentDrugSales(): Promise<DrugSaleResponse[]> {
  const res = await apiClient.get('/api/drugs/sales');
  return unwrap<{ sales: DrugSaleResponse[] }>(res).sales;
}

export async function getDrugSale(saleId: string): Promise<DrugSaleResponse> {
  const res = await apiClient.get(`/api/drugs/sale/${saleId}`);
  return unwrap(res);
}

export async function createDrugSale(input: {
  vetId: string;
  atcCode: string;
  batchNumber: string;
  quantity: number;
  awareClass: 'Access' | 'Watch' | 'Reserve';
}): Promise<CreateDrugSaleResponse> {
  const res = await apiClient.post('/api/drugs/sale', input);
  return unwrap(res);
}

/* ═══════════════════════════════════════════════════
   PRESCRIPTIONS (Vet)
   ═══════════════════════════════════════════════════ */

export async function createPrescription(input: {
  saleId: string;
  farmerId: string;
  animalLotId: string;
  diagnosis: string;
  dosage: number;
  withdrawalDays: number;
}): Promise<CreatePrescriptionResponse> {
  const res = await apiClient.post('/api/prescriptions', input);
  return unwrap(res);
}

export async function getPrescription(rxId: string): Promise<PrescriptionResponse> {
  const res = await apiClient.get(`/api/prescriptions/${rxId}`);
  return unwrap(res);
}

export async function confirmPrescription(rxId: string): Promise<ConfirmPrescriptionResponse> {
  const res = await apiClient.put(`/api/prescriptions/${rxId}/confirm`);
  return unwrap(res);
}

export async function getFarmerPrescriptions(farmerId: string): Promise<PrescriptionResponse[]> {
  const res = await apiClient.get(`/api/prescriptions/farm/${farmerId}`);
  return unwrap<{ prescriptions: PrescriptionResponse[] }>(res).prescriptions;
}

/* ═══════════════════════════════════════════════════
   LOTS (Abattoir / Traceability)
   ═══════════════════════════════════════════════════ */

export async function getEligibility(lotId: string, rxId: string): Promise<EligibilityResponse> {
  const res = await apiClient.get(`/api/lots/${lotId}/eligibility`, { params: { rxId } });
  return unwrap(res);
}

export async function certifyLot(lotId: string, rxId: string): Promise<CertifyLotResponse> {
  const res = await apiClient.post(`/api/lots/${lotId}/certify`, { rxId });
  return unwrap(res);
}

export async function getTraceability(lotId: string): Promise<TraceResponse> {
  const res = await apiClient.get(`/api/lots/${lotId}/trace`);
  return unwrap(res);
}

/* ═══════════════════════════════════════════════════
   PRODUCTS (Farmer → Consumer Marketplace)
   ═══════════════════════════════════════════════════ */

export async function getProducts(params?: {
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: ProductResponse[]; pagination: any }> {
  const res = await apiClient.get('/api/products', { params });
  return unwrap(res);
}

export async function getProduct(productId: string): Promise<{ product: ProductResponse }> {
  const res = await apiClient.get(`/api/products/${productId}`);
  return unwrap(res);
}

export async function publishProduct(input: {
  lotId: string;
  title: string;
  description?: string;
  category: string;
  pricePerUnit: number;
  unit: string;
  quantityAvailable: number;
  deliveryOptions: string;
  locationAddress?: string;
}): Promise<CreateProductResponse> {
  const res = await apiClient.post('/api/products', input);
  return unwrap(res);
}

export async function getFarmerPublishableLots(): Promise<{ lots: PublishableLotResponse[] }> {
  const res = await apiClient.get('/api/products/farmer/publishable-lots');
  return unwrap(res);
}

export async function updateProduct(productId: string, input: Record<string, any>): Promise<{ updated: boolean }> {
  const res = await apiClient.put(`/api/products/${productId}`, input);
  return unwrap(res);
}

/* ═══════════════════════════════════════════════════
   ORDERS (Consumer)
   ═══════════════════════════════════════════════════ */

export async function getOrders(): Promise<{ orders: OrderResponse[] }> {
  const res = await apiClient.get('/api/orders');
  return unwrap(res);
}

export async function getOrder(orderId: string): Promise<{ order: OrderResponse }> {
  const res = await apiClient.get(`/api/orders/${orderId}`);
  return unwrap(res);
}

export async function createOrder(input: {
  productId: string;
  quantity: number;
  deliveryOption: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string;
}): Promise<CreateOrderResponse> {
  const res = await apiClient.post('/api/orders', input);
  return unwrap(res);
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ orderId: string; previousStatus: string; newStatus: string }> {
  const res = await apiClient.put(`/api/orders/${orderId}/status`, { status });
  return unwrap(res);
}

/* ═══════════════════════════════════════════════════
   REVIEWS
   ═══════════════════════════════════════════════════ */

export async function createReview(input: {
  orderId: string;
  rating: number;
  comment?: string;
}): Promise<{ reviewId: string; rating: number }> {
  const res = await apiClient.post('/api/reviews', input);
  return unwrap(res);
}

export async function getFarmerReviews(
  farmerId: string
): Promise<{ reviews: any[]; avgRating: number; totalReviews: number }> {
  const res = await apiClient.get(`/api/reviews/farmer/${farmerId}`);
  return unwrap(res);
}

/* ═══════════════════════════════════════════════════
   AI ASSISTANT
   ═══════════════════════════════════════════════════ */

export async function askVetAssistant(
  symptoms: string,
  lotSize?: number
): Promise<VetAssistantResponse> {
  const res = await apiClient.post('/api/ai/assistant/vet', { symptoms, lotSize });
  return unwrap(res);
}

export async function askFarmerAssistant(
  question: string,
  lotId?: string
): Promise<{ answer: string; model: string }> {
  const res = await apiClient.post('/api/ai/assistant/farmer', { question, lotId });
  return unwrap(res);
}

export async function explainTrace(
  lotId: string
): Promise<{ explanation: string; lotId: string }> {
  const res = await apiClient.post('/api/ai/explain/trace', { lotId });
  return unwrap(res);
}

export async function getAIStatus(): Promise<any> {
  const res = await apiClient.get('/api/ai/status');
  return unwrap(res);
}
