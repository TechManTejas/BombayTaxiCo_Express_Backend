/**
 * Standardized API response helpers
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

/**
 * Creates a success response object
 */
export const successResponse = <T>(message: string, data?: T): ApiResponse<T> => {
  return {
    success: true,
    message: message || 'Success',
    data,
  };
};

/**
 * Creates an error response object
 */
export const errorResponse = (message: string, errors?: string[]): ApiResponse => {
  return {
    success: false,
    message: message || 'An error occurred',
    errors: errors || [],
  };
};

/**
 * Creates a validation error response
 */
export const validationErrorResponse = (missingFields: string[]): ApiResponse => {
  if (!missingFields || missingFields.length === 0) {
    return errorResponse('Validation failed');
  }
  const fieldList = missingFields.join(', ');
  return {
    success: false,
    message: `Missing required fields: ${fieldList}`,
    errors: missingFields.map(f => `${f} is required`),
  };
};

/**
 * Creates a not found response
 */
export const notFoundResponse = (resource: string | null | undefined): ApiResponse => {
  const name = resource || 'Resource';
  return {
    success: false,
    message: `${name} not found`,
  };
};

/**
 * Creates a paginated response
 */
export const paginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): ApiResponse<{ items: T[]; total: number; page: number; pageSize: number; totalPages: number }> => {
  const totalPages = Math.ceil(total / (pageSize || 1));
  return {
    success: true,
    message: 'Success',
    data: {
      items: items || [],
      total: total || 0,
      page: page || 1,
      pageSize: pageSize || 10,
      totalPages,
    },
  };
};

/**
 * Extracts a clean error message from an unknown error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};
