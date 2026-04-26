import axios from 'axios';

import {
  drugSales,
  lots,
  orders,
  prescriptions,
  products,
  txHashes,
  vets,
  type Lot,
  type Order,
  type Prescription,
  type Product,
} from '@/services/mockData';
import { getAuthSnapshot } from '@/store/authStore';
import { awareClassForAtc, type AwareClass } from '@/types/domain';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const { token } = getAuthSnapshot();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const delay = () => new Promise((resolve) => setTimeout(resolve, 180));

export async function getVets() {
  await delay();
  return vets;
}

export async function getRecentDrugSales() {
  await delay();
  return drugSales;
}

export async function createDrugSale(input: {
  atcCode: string;
  batchNumber: string;
  quantity: number;
  vetId: string;
}) {
  await delay();
  return {
    awareClass: awareClassForAtc(input.atcCode),
    saleId: `sale-${Date.now()}`,
    txHash: txHashes.sale,
  };
}

export async function getVetDrugSales() {
  await delay();
  return drugSales.filter((sale) => sale.vetId === 'vet-001');
}

export async function askVetAssistant(symptoms: string) {
  await delay();
  const severe = symptoms.toLowerCase().includes('colistine');

  return {
    atcCode: severe ? 'J01XB01' : 'J01CA04',
    awareClass: severe ? ('Reserve' as AwareClass) : ('Access' as AwareClass),
    molecule: severe ? 'Colistine' : 'Amoxicilline',
    recommendation: severe
      ? 'Reserve a un cas critique documente. Confirmer avec culture et antibiogramme.'
      : 'Traitement de premiere intention avec suivi du lot et respect du delai de retrait.',
    withdrawalDays: severe ? 7 : 3,
  };
}

export async function createPrescription(input: {
  animalLotId: string;
  diagnosis: string;
  farmerId: string;
  saleId: string;
  withdrawalDays: number;
}) {
  await delay();
  return {
    rxId: `rx-${Date.now()}`,
    txHash: txHashes.certificate,
    withdrawalEnd: '2026-05-03',
    ...input,
  };
}

export async function getPrescription(id = 'rx-901') {
  await delay();
  return prescriptions.find((prescription) => prescription.id === id) ?? prescriptions[1];
}

export async function confirmPrescription(id: string, payload: { administeredAt: string; notes?: string }) {
  await delay();
  return {
    confirmed: true,
    id,
    txHash: txHashes.certificate,
    withdrawalEnd: '2026-05-03',
    ...payload,
  };
}

export async function getFarmerLots() {
  await delay();
  return lots;
}

export async function getCertifiedLots() {
  await delay();
  return lots.filter((lot) => lot.status === 'CERTIFIED');
}

export async function publishProduct(input: {
  category: string;
  lotId: string;
  price: number;
  stock: number;
  title: string;
}) {
  await delay();
  return { productId: `product-${Date.now()}`, status: 'ACTIVE', ...input };
}

export async function getFarmerOrders() {
  await delay();
  return orders;
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  await delay();
  return { orderId, status };
}

export async function getEligibility(lotId: string) {
  await delay();
  const lot = lots.find((item) => item.id === lotId) ?? lots[1];
  const eligible = lot.status === 'CERTIFIED';

  return {
    daysRemaining: eligible ? 0 : 5,
    eligible,
    lotDetails: lot,
    prescription: prescriptions.find((prescription) => prescription.animalLotId === lot.id),
    txHash: eligible ? txHashes.certificate : prescriptions[1].txHash,
  };
}

export async function certifyLot(lotId: string) {
  await delay();
  return {
    certificateHash: txHashes.certificate,
    lotId,
    txHash: txHashes.certificate,
  };
}

export async function getProducts(category?: string) {
  await delay();
  return category ? products.filter((product) => product.category === category) : products;
}

export async function getProduct(productId = 'product-882') {
  await delay();
  return products.find((product) => product.id === productId) ?? products[0];
}

export async function getTraceability(lotId = 'L-882') {
  await delay();
  const lot = lots.find((item) => item.id === lotId) ?? lots[0];
  const product = products.find((item) => item.lotId === lot.id) ?? products[0];

  return {
    antibioticClass: lot.awareClass,
    certificateHash: product.certificateHash,
    farmRegion: lot.farmRegion,
    lotId: lot.id,
    productTitle: product.title,
    trustScore: product.trustScore,
    txHash: txHashes.certificate,
    withdrawalRespected: lot.status === 'CERTIFIED',
  };
}

export async function createOrder(input: {
  deliveryAddress?: string;
  deliveryMode: 'pickup' | 'delivery';
  productId: string;
  quantity: number;
  total: number;
}) {
  await delay();
  return {
    commission: input.total * 0.1,
    farmerPayout: input.total * 0.9,
    orderId: `order-${Date.now()}`,
    txHash: txHashes.order,
  };
}

export function lotTone(lot: Lot) {
  if (lot.status === 'CERTIFIED') {
    return 'green';
  }

  if (lot.status === 'WITHDRAWAL') {
    return 'amber';
  }

  return 'default';
}

export function productById(productId?: string): Product {
  return products.find((product) => product.id === productId) ?? products[0];
}

export function prescriptionByLot(lotId?: string): Prescription | undefined {
  return prescriptions.find((prescription) => prescription.animalLotId === lotId);
}
