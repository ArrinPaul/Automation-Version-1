export const MONTH_WINDOW = 6;

export const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatCurrency = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') {
    return currencyFormatter.format(0);
  }

  const numericValue = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return currencyFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
};

export const formatCompactCurrency = (value?: string | number | null) => {
  const numericValue = typeof value === 'number' ? value : Number.parseFloat(String(value ?? 0));
  if (!Number.isFinite(numericValue)) {
    return '₹0';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numericValue);

  return formatted.replaceAll(/\.0(?=\D|$)/g, '');
};

export const normalizeCollection = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const maybeData = (payload as { data?: unknown }).data;
    if (Array.isArray(maybeData)) {
      return maybeData as T[];
    }
  }

  return [];
};

export const normalizeRecord = <T,>(payload: unknown): T | null => {
  if (payload && typeof payload === 'object') {
    const maybeData = (payload as { data?: unknown }).data;
    if (maybeData && !Array.isArray(maybeData)) {
      return maybeData as T;
    }

    return payload as T;
  }

  return null;
};

export const isPresent = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
