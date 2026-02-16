/**
 * Input validation helpers for API endpoints
 */

/**
 * Validates an email address format
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (email === null || email === undefined) return false;
  const str = String(email).trim();
  if (!str) return false;
  if (str.includes('..')) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(str);
};

/**
 * Validates an Indian phone number (10 digits starting with 6-9)
 */
export const isValidPhone = (phone: string | null | undefined): boolean => {
  if (!phone) return false;
  let str = String(phone).trim();
  if (str.startsWith('+')) str = str.slice(1);
  let cleaned = str.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  }
  return /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Validates a MongoDB ObjectId format
 */
export const isValidObjectId = (id: string | null | undefined): boolean => {
  if (!id) return false;
  const trimmed = String(id).trim();
  if (!trimmed) return false;
  return /^[0-9a-fA-F]{24}$/.test(trimmed);
};

/**
 * Validates pagination parameters and returns safe defaults
 */
export const validatePagination = (
  page: string | number | null | undefined,
  pageSize: string | number | null | undefined
): { page: number; pageSize: number; skip: number } => {
  let p = typeof page === 'string' ? parseInt(page, 10) : (typeof page === 'number' ? page : 1);
  let ps = typeof pageSize === 'string' ? parseInt(pageSize, 10) : (typeof pageSize === 'number' ? pageSize : 10);

  if (isNaN(p) || p < 1) p = 1;
  if (isNaN(ps) || ps < 1) ps = 10;
  if (ps > 100) ps = 100;

  return { page: p, pageSize: ps, skip: (p - 1) * ps };
};

/**
 * Validates that required fields are present in an object
 */
export const validateRequiredFields = (
  data: Record<string, any> | null | undefined,
  requiredFields: string[]
): { valid: boolean; missing: string[] } => {
  if (!data) return { valid: false, missing: requiredFields };
  const missing = requiredFields.filter(field => {
    const value = data[field];
    return value === null || value === undefined || value === '';
  });
  return { valid: missing.length === 0, missing };
};

/**
 * Sanitizes a string to prevent basic XSS
 */
export const sanitizeString = (input: string | null | undefined): string => {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Validates a date string
 */
export const isValidDate = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  const trimmed = String(dateStr).trim();
  if (!trimmed) return false;
  const date = new Date(trimmed);
  return !isNaN(date.getTime());
};

/**
 * Checks if a date is in the future
 */
export const isFutureDate = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  const trimmed = String(dateStr).trim();
  if (!trimmed) return false;
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return false;
  return date > new Date();
};
