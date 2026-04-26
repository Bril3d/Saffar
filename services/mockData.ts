import { type AwareClass, type OrderStatus, type PrescriptionStatus } from '@/types/domain';

export type DrugSale = {
  atcCode: string;
  awareClass: AwareClass;
  batchNumber: string;
  id: string;
  quantity: number;
  txHash: string;
  vetId: string;
  vetName: string;
};

export type VetProfile = {
  id: string;
  license: string;
  name: string;
};

export type Prescription = {
  animalLotId: string;
  atcCode: string;
  awareClass: AwareClass;
  diagnosis: string;
  dosage: string;
  farmerId: string;
  id: string;
  prescriptionDate: string;
  saleId: string;
  status: PrescriptionStatus;
  txHash: string;
  vetName: string;
  withdrawalDays: number;
  withdrawalEnd: string;
};

export type Lot = {
  antibiotic: string;
  awareClass: AwareClass;
  countdown: string;
  farmRegion: string;
  id: string;
  name: string;
  status: 'WITHDRAWAL' | 'CERTIFIED' | 'PENDING';
  withdrawalEnd: string;
};

export type Product = {
  awareClass: AwareClass;
  category: string;
  certificateHash: string;
  farmRegion: string;
  id: string;
  imageLabel: string;
  lotId: string;
  price: number;
  stock: number;
  title: string;
  trustScore: number;
  unit: string;
};

export type Order = {
  consumerName: string;
  id: string;
  productTitle: string;
  quantity: number;
  status: OrderStatus;
  total: number;
};

export const vets: VetProfile[] = [
  { id: 'vet-001', license: 'TN-VET-1001', name: 'Dr. Sami Ben Ali' },
  { id: 'vet-002', license: 'TN-VET-1033', name: 'Dr. Lina Mansour' },
  { id: 'vet-003', license: 'TN-VET-1148', name: 'Dr. Youssef Trabelsi' },
];

export const drugSales: DrugSale[] = [
  {
    atcCode: 'J01CA04',
    awareClass: 'Access',
    batchNumber: 'AMX-04-26',
    id: 'sale-882',
    quantity: 120,
    txHash: '0x8e4a2b91c12958cfb281a1ad70a2cb0d1c2b6407c4459dd7a4af1281bdf882aa',
    vetId: 'vet-001',
    vetName: 'Dr. Sami Ben Ali',
  },
  {
    atcCode: 'J01XB01',
    awareClass: 'Reserve',
    batchNumber: 'COL-17-26',
    id: 'sale-901',
    quantity: 24,
    txHash: '0x7c0d2c420ea7edbaf817d8a49d8c1b7df44792f0caa41053dfcef9011128b901',
    vetId: 'vet-002',
    vetName: 'Dr. Lina Mansour',
  },
];

export const prescriptions: Prescription[] = [
  {
    animalLotId: 'L-882',
    atcCode: 'J01CA04',
    awareClass: 'Access',
    diagnosis: 'Infection respiratoire legere',
    dosage: 'Amoxicilline 5 jours',
    farmerId: 'farmer-001',
    id: 'rx-882',
    prescriptionDate: '2026-04-20',
    saleId: 'sale-882',
    status: 'CERTIFIED',
    txHash: '0xdf8f1d2719961c41cc3b7db14a961c9cf040220eaa2716d5900718bb55a60c44',
    vetName: 'Dr. Sami Ben Ali',
    withdrawalDays: 3,
    withdrawalEnd: '2026-04-23',
  },
  {
    animalLotId: 'L-901',
    atcCode: 'J01XB01',
    awareClass: 'Reserve',
    diagnosis: 'Traitement encadre, dernier recours',
    dosage: 'Colistine protocole restreint',
    farmerId: 'farmer-001',
    id: 'rx-901',
    prescriptionDate: '2026-04-24',
    saleId: 'sale-901',
    status: 'WITHDRAWAL',
    txHash: '0xabc91d2719961c41cc3b7db14a961c9cf040220eaa2716d5900718bb55a901',
    vetName: 'Dr. Lina Mansour',
    withdrawalDays: 7,
    withdrawalEnd: '2026-05-01',
  },
];

export const lots: Lot[] = [
  {
    antibiotic: 'Amoxicilline',
    awareClass: 'Access',
    countdown: 'J-0',
    farmRegion: 'Nabeul',
    id: 'L-882',
    name: 'Lot L-882 - Poulets fermiers',
    status: 'CERTIFIED',
    withdrawalEnd: '2026-04-23',
  },
  {
    antibiotic: 'Colistine',
    awareClass: 'Reserve',
    countdown: 'J-5',
    farmRegion: 'Zaghouan',
    id: 'L-901',
    name: 'Lot L-901 - Dindes',
    status: 'WITHDRAWAL',
    withdrawalEnd: '2026-05-01',
  },
  {
    antibiotic: 'Aucun traitement actif',
    awareClass: 'Access',
    countdown: 'Controle requis',
    farmRegion: 'Bizerte',
    id: 'L-914',
    name: 'Lot L-914 - Oeufs plein air',
    status: 'PENDING',
    withdrawalEnd: '2026-05-06',
  },
];

export const products: Product[] = [
  {
    awareClass: 'Access',
    category: 'Poulet',
    certificateHash: '0xcert8827bdb14a961c9cf040220eaa2716d5900718bb55a60c44',
    farmRegion: 'Nabeul',
    id: 'product-882',
    imageLabel: 'Poulet certifie',
    lotId: 'L-882',
    price: 9,
    stock: 28,
    title: 'Poulet fermier certifie',
    trustScore: 98,
    unit: 'kg',
  },
  {
    awareClass: 'Access',
    category: 'Oeufs',
    certificateHash: '0xcert9147bdb14a961c9cf040220eaa2716d5900718bb55a60c44',
    farmRegion: 'Bizerte',
    id: 'product-914',
    imageLabel: 'Oeufs certifies',
    lotId: 'L-914',
    price: 12,
    stock: 42,
    title: 'Plateau oeufs plein air',
    trustScore: 91,
    unit: 'plateau',
  },
];

export const orders: Order[] = [
  {
    consumerName: 'Maya K.',
    id: 'order-1001',
    productTitle: 'Poulet fermier certifie',
    quantity: 3,
    status: 'PENDING',
    total: 27,
  },
  {
    consumerName: 'Nour B.',
    id: 'order-1002',
    productTitle: 'Plateau oeufs plein air',
    quantity: 1,
    status: 'CONFIRMED',
    total: 12,
  },
];

export const txHashes = {
  certificate: '0x6ec7c26412f9fd20a3a12f5f55d9826a493487c341d3882fab6726e7e431bd83',
  order: '0x2e5d8a280c7b551f2dd5ff8f42f59d6823e47f14a861af7e54002f4e0b263777',
  sale: '0x50760f31fe5af9a7fcb7a470cfeb0f9a141a4d759dd070602da19f7219517c3f',
};
