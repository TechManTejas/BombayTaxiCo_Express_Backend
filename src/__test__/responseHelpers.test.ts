import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  paginatedResponse,
  getErrorMessage,
} from '../utils/responseHelpers';

describe('successResponse', () => {
  test('creates success response with data', () => {
    const res = successResponse('Created', { id: '123' });
    expect(res.success).toBe(true);
    expect(res.message).toBe('Created');
    expect(res.data).toEqual({ id: '123' });
  });

  test('creates success response without data', () => {
    const res = successResponse('Done');
    expect(res.success).toBe(true);
    expect(res.data).toBeUndefined();
  });

  test('uses default message for empty string', () => {
    const res = successResponse('');
    expect(res.message).toBe('Success');
  });
});

describe('errorResponse', () => {
  test('creates error response with message', () => {
    const res = errorResponse('Something went wrong');
    expect(res.success).toBe(false);
    expect(res.message).toBe('Something went wrong');
  });

  test('creates error response with errors array', () => {
    const res = errorResponse('Validation failed', ['field1 is required']);
    expect(res.errors).toContain('field1 is required');
  });

  test('uses default message for empty string', () => {
    const res = errorResponse('');
    expect(res.message).toBe('An error occurred');
  });

  test('defaults errors to empty array', () => {
    const res = errorResponse('Error');
    expect(res.errors).toEqual([]);
  });
});

describe('validationErrorResponse', () => {
  test('lists missing fields in message', () => {
    const res = validationErrorResponse(['name', 'email']);
    expect(res.success).toBe(false);
    expect(res.message).toContain('name');
    expect(res.message).toContain('email');
  });

  test('creates error entries for each field', () => {
    const res = validationErrorResponse(['name', 'email']);
    expect(res.errors).toHaveLength(2);
    expect(res.errors![0]).toContain('name');
  });

  test('handles empty array', () => {
    const res = validationErrorResponse([]);
    expect(res.success).toBe(false);
    expect(res.message).toBe('Validation failed');
  });

  test('handles null input', () => {
    const res = validationErrorResponse(null as any);
    expect(res.success).toBe(false);
  });
});

describe('notFoundResponse', () => {
  test('creates not found response with resource name', () => {
    const res = notFoundResponse('Booking');
    expect(res.success).toBe(false);
    expect(res.message).toBe('Booking not found');
  });

  test('uses default name for null', () => {
    const res = notFoundResponse(null);
    expect(res.message).toBe('Resource not found');
  });

  test('uses default name for undefined', () => {
    const res = notFoundResponse(undefined);
    expect(res.message).toBe('Resource not found');
  });
});

describe('paginatedResponse', () => {
  test('creates paginated response', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const res = paginatedResponse(items, 50, 1, 10);
    expect(res.success).toBe(true);
    expect(res.data!.items).toHaveLength(2);
    expect(res.data!.total).toBe(50);
    expect(res.data!.totalPages).toBe(5);
  });

  test('calculates total pages correctly', () => {
    const res = paginatedResponse([], 23, 1, 10);
    expect(res.data!.totalPages).toBe(3);
  });

  test('handles empty items', () => {
    const res = paginatedResponse([], 0, 1, 10);
    expect(res.data!.items).toHaveLength(0);
    expect(res.data!.totalPages).toBe(0);
  });

  test('handles zero pageSize without division by zero', () => {
    const res = paginatedResponse([], 10, 1, 0);
    expect(res.data!.pageSize).toBe(10);
    expect(res.data!.totalPages).toBe(1);
  });
});

describe('getErrorMessage', () => {
  test('extracts message from Error object', () => {
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  test('returns string errors directly', () => {
    expect(getErrorMessage('something failed')).toBe('something failed');
  });

  test('returns default for unknown types', () => {
    expect(getErrorMessage(42)).toBe('42');
  });

  test('returns default for null', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
  });

  test('returns default for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
  });
});
