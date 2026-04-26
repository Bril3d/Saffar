/**
 * Locale helpers — fr-TN formatting for numbers, prices, dates, relative times.
 *
 * All SAFAR Chain UI uses these helpers so the demo feels rooted in the
 * Tunisian market: comma decimal separator, "DT" currency suffix,
 * 24h clock, `il y a X h` relative style.
 */

const LOCALE = 'fr-TN';

// Safe Intl helpers — fall back to toLocaleString on unsupported runtimes.

export function formatNumber(value: number, fractionDigits = 0): string {
  try {
    return new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return value.toFixed(fractionDigits).replace('.', ',');
  }
}

export function formatPrice(value: number, currency: 'DT' | 'TND' = 'DT'): string {
  // We use a custom DT suffix (Tunisians write "12,50 DT" locally) rather
  // than Intl currency which would give "12,50 TND".
  return `${formatNumber(value, 2)} ${currency}`;
}

export function formatWeight(value: number, unit: 'kg' | 'g' = 'kg'): string {
  return `${formatNumber(value, value % 1 === 0 ? 0 : 2)} ${unit}`;
}

export function formatDate(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

export function formatDateTime(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

/**
 * `il y a 2 h`, `il y a 3 j`, `dans 4 j` etc.
 */
export function formatRelative(input: string | Date, now: Date = new Date()): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = date.getTime() - now.getTime();
  const past = diffMs < 0;
  const abs = Math.abs(diffMs);

  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  if (mins < 1) return "à l'instant";
  if (mins < 60) return past ? `il y a ${mins} min` : `dans ${mins} min`;
  if (hours < 24) return past ? `il y a ${hours} h` : `dans ${hours} h`;
  return past ? `il y a ${days} j` : `dans ${days} j`;
}

/**
 * Compact countdown "4 j 12 h", "12 h 30 min" — for withdrawal periods.
 */
export function formatCountdown(targetDate: string | Date, now: Date = new Date()): string {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'Terminé';

  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);

  if (days > 0) return `${days} j ${hours} h`;
  if (hours > 0) return `${hours} h ${mins} min`;
  return `${mins} min`;
}

/**
 * Truncate a 0x... blockchain hash to "0xa3f4…b7e2".
 */
export function truncateHash(hash: string, lead = 6, trail = 4): string {
  if (!hash) return '';
  if (hash.length <= lead + trail + 2) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-trail)}`;
}

/**
 * Tunisian governorates (24) — used in signup, delivery address, farmer region.
 */
export const TUNISIAN_GOVERNORATES = [
  'Ariana',
  'Béja',
  'Ben Arous',
  'Bizerte',
  'Gabès',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kébili',
  'Kef',
  'Mahdia',
  'Manouba',
  'Médenine',
  'Monastir',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tataouine',
  'Tozeur',
  'Tunis',
  'Zaghouan',
] as const;

export type Governorate = (typeof TUNISIAN_GOVERNORATES)[number];

/**
 * Regex matching the Tunisian mobile pattern: `+216[2-9]xxxxxxx`.
 */
export const TN_MOBILE_REGEX = /^(?:\+216)?[2-9]\d{7}$/;

export function isValidTunisianMobile(raw: string): boolean {
  return TN_MOBILE_REGEX.test(raw.replace(/\s/g, ''));
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

/**
 * Tiny Arabic strings for product names + regions (used on consumer cards
 * as a subtle touch of Tunisian authenticity).
 */
export const AR_REGIONS: Record<string, string> = {
  Ariana: 'أريانة',
  Béja: 'باجة',
  'Ben Arous': 'بن عروس',
  Bizerte: 'بنزرت',
  Gabès: 'قابس',
  Gafsa: 'قفصة',
  Jendouba: 'جندوبة',
  Kairouan: 'القيروان',
  Kasserine: 'القصرين',
  Kébili: 'قبلي',
  Kef: 'الكاف',
  Mahdia: 'المهدية',
  Manouba: 'منوبة',
  Médenine: 'مدنين',
  Monastir: 'المنستير',
  Nabeul: 'نابل',
  Sfax: 'صفاقس',
  'Sidi Bouzid': 'سيدي بوزيد',
  Siliana: 'سليانة',
  Sousse: 'سوسة',
  Tataouine: 'تطاوين',
  Tozeur: 'توزر',
  Tunis: 'تونس',
  Zaghouan: 'زغوان',
};

export const AR_PRODUCT_KINDS: Record<string, string> = {
  Poulet: 'دجاج',
  Bovin: 'بقري',
  Ovin: 'خروف',
  Oeufs: 'بيض',
  Volaille: 'طيور',
};
