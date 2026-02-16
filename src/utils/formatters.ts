/**
 * Data formatting helpers for API responses
 */

/**
 * Formats a phone number for display (Indian format)
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (phone === null || phone === undefined) return '';
  const phoneStr = String(phone);
  const cleaned = phoneStr.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const number = cleaned.slice(2);
    return `+91 ${number.slice(0, 5)}-${number.slice(5)}`;
  }
  return phoneStr;
};

/**
 * Formats currency amount in INR
 */
export const formatINR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) return '₹0';
  if (amount < 0) return `-₹${Math.abs(amount).toLocaleString('en-IN')}`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Formats a date for API response
 */
export const formatDate = (date: Date | string | number | null | undefined): string => {
  if (date === null || date === undefined) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

/**
 * Formats a booking number with prefix
 */
export const formatBookingNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return 'BTC-000000';
  const safeNum = Math.abs(Math.floor(num));
  return `BTC-${String(safeNum).padStart(6, '0')}`;
};

/**
 * Truncates a string to a max length
 */
export const truncateString = (str: string | null | undefined, maxLen: number): string => {
  if (str === null || str === undefined) return '';
  const s = String(str);
  if (isNaN(maxLen) || maxLen <= 0) return '';
  if (s.length <= maxLen) return s;
  if (maxLen <= 3) return s.substring(0, maxLen);
  return s.substring(0, maxLen - 3) + '...';
};

/**
 * Capitalizes the first letter of each word
 */
export const titleCase = (str: string | null | undefined): string => {
  if (str === null || str === undefined) return '';
  const s = String(str).trim();
  if (!s) return '';
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formats a distance in km
 */
export const formatDistance = (km: number | null | undefined): string => {
  if (km === null || km === undefined || isNaN(km)) return '0 km';
  if (km < 0 || !isFinite(km)) return '0 km';
  return `${km.toFixed(1)} km`;
};
