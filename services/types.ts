/**
 * SAFAR Chain — API Response Types
 * Matches the backend envelope: { success, data, error, meta }
 */

/* ── Generic API Envelope ────────────────────────── */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
  meta: { timestamp: string; txHash?: string };
}

/* ── Auth ─────────────────────────────────────────── */

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
    walletAddress: string | null;
  };
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
  };
}

/* ── Drug Sales ──────────────────────────────────── */

export interface DrugSaleResponse {
  sale_id: string;
  pharmacy_id: string;
  vet_id: string;
  atc_code: string;
  batch_number: string;
  quantity: number;
  aware_class: string;
  tx_hash: string;
  created_at: string;
}

export interface CreateDrugSaleResponse {
  saleId: string;
  txHash: string;
  atcCode: string;
  awareClass: string;
  quantity: number;
}

/* ── Prescriptions ───────────────────────────────── */

export interface PrescriptionResponse {
  rx_id: string;
  sale_id: string;
  vet_id: string;
  farmer_id: string;
  animal_lot_id: string;
  diagnosis: string;
  dosage: number;
  withdrawal_days: number;
  withdrawal_end: string;
  start_date: string;
  administered: number;
  admin_timestamp: string | null;
  tx_hash: string;
  created_at: string;
  chainData?: {
    administered: boolean;
    adminTimestamp: string | null;
    withdrawalEnd: string;
  } | null;
}

export interface CreatePrescriptionResponse {
  rxId: string;
  txHash: string;
  withdrawalEnd: string;
  effectiveWithdrawalDays: number;
  note?: string;
}

export interface ConfirmPrescriptionResponse {
  confirmed: boolean;
  txHash: string;
  adminTimestamp: string;
  withdrawalEnd: string;
}

/* ── Lots ─────────────────────────────────────────── */

export interface EligibilityResponse {
  lotId: string;
  eligible: boolean;
  daysRemaining: number;
  prescriptions: Array<{
    rx_id: string;
    diagnosis: string;
    withdrawal_end: string;
    administered: number;
  }>;
}

export interface CertifyLotResponse {
  lotId: string;
  certificateHash: string;
  txHash: string;
}

export interface TraceResponse {
  lotId: string;
  lotDetails?: {
    totalTreatments: number;
    administeredTreatments: number;
    latestWithdrawalEnd: string | null;
    inWithdrawal: boolean;
  };
  farmerVetTraceability?: {
    distinctVeterinarians: number;
    distinctFarmers: number;
    linked: boolean;
  };
  prescriptions: Array<{
    antibiotic: string;
    awareClass: string;
    treatmentStart: string | null;
    withdrawalEnd: string | null;
    administered: boolean;
  }>;
  certification: {
    certified: boolean;
    certificateHash?: string;
    certifiedAt?: string;
    txHash?: string;
    onChainValid?: boolean | null;
  };
  trustScore: number;
  verifiedOnBlockchain: boolean;
}

/* ── Products ────────────────────────────────────── */

export interface ProductResponse {
  id: string;
  farmer_id: string;
  lot_id: string;
  certificate_hash: string;
  lot_tx_hash?: string | null;
  lot_certified_at?: string | null;
  on_chain_certified?: number;
  total_treatments?: number;
  administered_treatments?: number;
  latest_withdrawal_end?: string | null;
  active_withdrawal_count?: number;
  title: string;
  description: string | null;
  category: string;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  delivery_options: string;
  status: string;
  location_address: string | null;
  farmer_name: string;
  farmer_governorate: string;
  avg_rating: number;
  created_at: string;
}

export interface CreateProductResponse {
  productId: string;
  status: string;
  certificateHash: string;
}

export interface PublishableLotResponse {
  lotId: string;
  totalTreatments: number;
  administeredTreatments: number;
  latestWithdrawalEnd: string | null;
  eligibleForMarketplace: boolean;
  certified: boolean;
  certificateHash: string | null;
}

/* ── Orders ──────────────────────────────────────── */

export interface OrderResponse {
  id: string;
  product_id: string;
  consumer_id: string;
  farmer_id: string;
  quantity: number;
  total_price: number;
  commission: number;
  farmer_payout: number;
  delivery_option: string;
  delivery_address: string | null;
  status: string;
  product_title: string;
  created_at: string;
}

export interface CreateOrderResponse {
  orderId: string;
  totalPrice: number;
  commission: number;
  farmerPayout: number;
  status: string;
}

/* ── AI ──────────────────────────────────────────── */

export interface VetAssistantResponse {
  recommendation: string;
  model: string;
  ragContext: {
    diseaseMatches: Array<{
      disease: string;
      confidence: number;
      firstLine: string;
    }>;
  };
  guardrails: {
    warnings: string[];
    steps: string[];
    usedFallback: boolean;
  };
  disclaimer: string;
}

/* ── Reviews ─────────────────────────────────────── */

export interface ReviewResponse {
  id: string;
  order_id: string;
  consumer_id: string;
  farmer_id: string;
  rating: number;
  comment: string | null;
  consumer_name: string;
  created_at: string;
}
