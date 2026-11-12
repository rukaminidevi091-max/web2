export interface CurrencyInfo {
  code: string;
  symbol: string;
  label: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', label: 'USD ($) — US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) — Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) — British Pound', locale: 'en-GB' },
  { code: 'INR', symbol: '₹', label: 'INR (₹) — Indian Rupee', locale: 'en-IN' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$) — Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'AU$', label: 'AUD (AU$) — Australian Dollar', locale: 'en-AU' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥) — Japanese Yen', locale: 'ja-JP' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF (CHF) — Swiss Franc', locale: 'de-CH' },
  { code: 'CNY', symbol: '¥', label: 'CNY (¥) — Chinese Yuan', locale: 'zh-CN' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$) — Singapore Dollar', locale: 'en-SG' },
  { code: 'AED', symbol: 'AED', label: 'AED (AED) — UAE Dirham', locale: 'ar-AE' },
  { code: 'BRL', symbol: 'R$', label: 'BRL (R$) — Brazilian Real', locale: 'pt-BR' },
  { code: 'MXN', symbol: 'MX$', label: 'MXN (MX$) — Mexican Peso', locale: 'es-MX' }
];

export function getCurrencySymbol(currencyCode = 'USD'): string {
  const match = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === currencyCode.toUpperCase());
  return match?.symbol || currencyCode;
}

export function formatPrice(priceMinor: number | undefined | null, currencyCode = 'USD'): string {
  if (priceMinor === undefined || priceMinor === null || isNaN(priceMinor)) {
    return 'Check Store';
  }
  const code = (currencyCode || 'USD').toUpperCase();
  const match = SUPPORTED_CURRENCIES.find(c => c.code === code);
  const locale = match?.locale || 'en-US';
  const major = priceMinor / 100;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: priceMinor % 100 === 0 ? 0 : 2
    }).format(major);
  } catch {
    const sym = match?.symbol || code;
    return `${sym}${major.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
}

export function minorToMajor(priceMinor: number | undefined | null): number {
  if (!priceMinor || isNaN(priceMinor)) return 0;
  return Number((priceMinor / 100).toFixed(2));
}

export function majorToMinor(priceMajor: number | undefined | null): number {
  if (!priceMajor || isNaN(priceMajor)) return 0;
  return Math.round(priceMajor * 100);
}

