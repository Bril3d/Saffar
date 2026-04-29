export interface ContractInterfaceRef {
  name: string;
  address: string | null;
  methods: string[];
}

export interface SafarContractInterfaces {
  accessControl: ContractInterfaceRef;
  drugRegistry: ContractInterfaceRef;
  prescriptionRegistry: ContractInterfaceRef;
  slaughterGate: ContractInterfaceRef;
}

export interface ReadySdk {
  status: 'ready';
  chainId: number;
  network: string;
  contracts: SafarContractInterfaces;
}

function envAddress(name: string): string | null {
  const key = `EXPO_PUBLIC_CONTRACT_${name.toUpperCase()}_ADDRESS`;
  const env = process.env as Record<string, string | undefined>;
  return env[key] || null;
}

export async function getSafarSdk(): Promise<ReadySdk> {
  return {
    status: 'ready',
    chainId: Number(process.env.EXPO_PUBLIC_CHAIN_ID || 1337),
    network: process.env.EXPO_PUBLIC_CHAIN_NETWORK || 'localhost',
    contracts: {
      accessControl: {
        name: 'AccessControl',
        address: envAddress('access_control'),
        methods: ['getRole', 'isRegistered']
      },
      drugRegistry: {
        name: 'DrugRegistry',
        address: envAddress('drug_registry'),
        methods: ['getSale', 'getVetPurchases']
      },
      prescriptionRegistry: {
        name: 'PrescriptionRegistry',
        address: envAddress('prescription_registry'),
        methods: ['getPrescription']
      },
      slaughterGate: {
        name: 'SlaughterGate',
        address: envAddress('slaughter_gate'),
        methods: ['checkEligibility', 'verifyCertificate', 'getLotVerification']
      }
    }
  };
}

export async function assertSdkReady() {
  const sdk = await getSafarSdk();
  if (sdk.status !== 'ready') {
    throw new Error('Blockchain SDK not initialized');
  }
  return sdk;
}
