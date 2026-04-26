import { colors } from '@/constants/theme';

export type Role = 'PHARMACY' | 'VET' | 'FARMER' | 'SLAUGHTERHOUSE' | 'CONSUMER';

export type AwareClass = 'Access' | 'Watch' | 'Reserve';

export type ActorKey = 'pharmacy' | 'vet' | 'farmer' | 'abattoir' | 'consumer';

export const ACTORS: Record<
  Role,
  {
    accent: string;
    accentBg: string;
    description: string;
    homePath: `/${ActorKey}/home`;
    key: ActorKey;
    label: string;
  }
> = {
  PHARMACY: {
    accent: colors.role.pharmacy,
    accentBg: colors.role.pharmacyBg,
    description: 'Ventes antibiotiques et lots dispenses',
    homePath: '/pharmacy/home',
    key: 'pharmacy',
    label: 'Pharmacie',
  },
  VET: {
    accent: colors.role.vet,
    accentBg: colors.role.vetBg,
    description: 'Prescriptions, IA locale et delais de retrait',
    homePath: '/vet/home',
    key: 'vet',
    label: 'Veterinaire',
  },
  FARMER: {
    accent: colors.role.farmer,
    accentBg: colors.role.farmerBg,
    description: 'Administration, lots et ventes directes',
    homePath: '/farmer/home',
    key: 'farmer',
    label: 'Eleveur',
  },
  SLAUGHTERHOUSE: {
    accent: colors.role.slaughterhouse,
    accentBg: colors.role.slaughterhouseBg,
    description: 'Scan QR et certification des lots',
    homePath: '/abattoir/home',
    key: 'abattoir',
    label: 'Abattoir',
  },
  CONSUMER: {
    accent: colors.role.consumer,
    accentBg: colors.role.consumerBg,
    description: 'Catalogue, tracabilite et commandes',
    homePath: '/consumer/home',
    key: 'consumer',
    label: 'Consommateur',
  },
};

export const ROLES = Object.keys(ACTORS) as Role[];

export function roleHomePath(role: Role) {
  return ACTORS[role].homePath;
}

export function awareClassForAtc(atcCode: string): AwareClass {
  const normalized = atcCode.trim().toUpperCase();

  if (normalized.startsWith('J01XB')) {
    return 'Reserve';
  }

  if (normalized.startsWith('J01AA') || normalized.startsWith('J01CR') || normalized.startsWith('J01FA')) {
    return 'Watch';
  }

  return 'Access';
}

export type PrescriptionStatus = 'CREATED' | 'ADMINISTERED' | 'WITHDRAWAL' | 'CERTIFIED';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED';
