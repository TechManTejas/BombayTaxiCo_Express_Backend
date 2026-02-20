/**
 * Simple Response Formatter Utility
 * Basic API response formatting and standardization
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export class ResponseFormatter {
  private static instance: ResponseFormatter;
  private defaultOptions: {
    includeTimestamp: boolean;
    includeRequestId: boolean;
    requestIdGenerator?: () => string;
  };

  private constructor() {
    this.defaultOptions = {
      includeTimestamp: true,
      includeRequestId: false
    };
  }

  static getInstance(): ResponseFormatter {
    if (!ResponseFormatter.instance) {
      ResponseFormatter.instance = new ResponseFormatter();
    }
    return ResponseFormatter.instance;
  }

  setDefaultOptions(options: Partial<typeof ResponseFormatter.prototype.defaultOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  private generateMeta(requestId?: string): ApiResponse['meta'] {
    const meta: ApiResponse['meta'] = {};

    if (this.defaultOptions.includeTimestamp) {
      meta.timestamp = new Date().toISOString();
    }

    if (this.defaultOptions.includeRequestId) {
      meta.requestId = requestId || (this.defaultOptions.requestIdGenerator?.() || this.generateRequestId());
    }

    return meta;
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  success<T>(data: T, message?: string, requestId?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: this.generateMeta(requestId)
    };
  }

  error(message: string, requestId?: string, errors?: Record<string, string[]>): ApiResponse {
    return {
      success: false,
      error: message,
      errors,
      meta: this.generateMeta(requestId)
    };
  }

  paginated<T>(
    data: T[],
    pagination: PaginationOptions,
    message?: string,
    requestId?: string
  ): ApiResponse<T[]> {
    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      message,
      meta: {
        ...this.generateMeta(requestId),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    };
  }

  created<T>(data: T, message?: string, requestId?: string): ApiResponse<T> {
    return this.success(data, message || 'Resource created successfully', requestId);
  }

  updated<T>(data: T, message?: string, requestId?: string): ApiResponse<T> {
    return this.success(data, message || 'Resource updated successfully', requestId);
  }

  deleted(message?: string, requestId?: string): ApiResponse {
    return this.success(null, message || 'Resource deleted successfully', requestId);
  }

  notFound(resource: string = 'Resource', requestId?: string): ApiResponse {
    return this.error(`${resource} not found`, requestId);
  }

  badRequest(message: string = 'Invalid request', errors?: Record<string, string[]>, requestId?: string): ApiResponse {
    return this.error(message, requestId, errors);
  }

  unauthorized(message: string = 'Unauthorized access', requestId?: string): ApiResponse {
    return this.error(message, requestId);
  }

  forbidden(message: string = 'Access denied', requestId?: string): ApiResponse {
    return this.error(message, requestId);
  }

  internalError(message: string = 'Internal server error', requestId?: string): ApiResponse {
    return this.error(message, requestId);
  }

  validationErrors(errors: Record<string, string[]>, requestId?: string): ApiResponse {
    return this.error('Validation failed', requestId, errors);
  }
}

// Export singleton instance
export const responseFormatter = ResponseFormatter.getInstance();

// Utility functions for common response patterns
export const createSuccessResponse = <T>(data: T, message?: string) => 
  responseFormatter.success(data, message);

export const createErrorResponse = (message: string, errors?: Record<string, string[]>) => 
  responseFormatter.error(message, undefined, errors);

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginationOptions,
  message?: string
) => responseFormatter.paginated(data, pagination, message);

export const createNotFoundResponse = (resource?: string) => 
  responseFormatter.notFound(resource);

export const createValidationErrorResponse = (errors: Record<string, string[]>) => 
  responseFormatter.validationErrors(errors);

// Express middleware helper
export const formatResponse = (formatter: ResponseFormatter = responseFormatter) => {
  return (req: any, res: any, next: any) => {
    // Add response formatting methods to res object
    res.success = (data: any, message?: string) => {
      return res.json(formatter.success(data, message, req.id));
    };

    res.error = (message: string, errors?: Record<string, string[]>) => {
      return res.json(formatter.error(message, req.id, errors));
    };

    res.paginated = (data: any[], pagination: PaginationOptions, message?: string) => {
      return res.json(formatter.paginated(data, pagination, message, req.id));
    };

    res.created = (data: any, message?: string) => {
      return res.status(201).json(formatter.created(data, message, req.id));
    };

    res.notFound = (resource?: string) => {
      return res.status(404).json(formatter.notFound(resource, req.id));
    };

    res.badRequest = (message?: string, errors?: Record<string, string[]>) => {
      return res.status(400).json(formatter.badRequest(message, errors, req.id));
    };

    res.unauthorized = (message?: string) => {
      return res.status(401).json(formatter.unauthorized(message, req.id));
    };

    res.forbidden = (message?: string) => {
      return res.status(403).json(formatter.forbidden(message, req.id));
    };

    res.internalError = (message?: string) => {
      return res.status(500).json(formatter.internalError(message, req.id));
    };

    next();
  };
};

// Type guards
export const isSuccessResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } => {
  return response.success === true;
};

export const isErrorResponse = (response: ApiResponse): response is ApiResponse & { success: false } => {
  return response.success === false;
};

export const hasPagination = <T>(response: ApiResponse<T[]>): response is ApiResponse<T[]> & { meta: { pagination: any } } => {
  return !!(response.meta?.pagination);
};

// Utility functions for response data extraction
export const extractData = <T>(response: ApiResponse<T>): T | null => {
  return isSuccessResponse(response) ? response.data || null : null;
};

export const extractError = (response: ApiResponse): string | null => {
  return isErrorResponse(response) ? response.error || null : null;
};

export const extractErrors = (response: ApiResponse): Record<string, string[]> | null => {
  return isErrorResponse(response) ? response.errors || null : null;
};

export const extractPagination = (response: ApiResponse): PaginationOptions | null => {
  return hasPagination(response) ? response.meta!.pagination : null;
};

// Response validation
export const validateApiResponse = (response: any): response is ApiResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.success === 'boolean' &&
    (response.data === undefined || response.error === undefined) &&
    (response.message === undefined || typeof response.message === 'string') &&
    (response.error === undefined || typeof response.error === 'string')
  );
};

// Response transformation utilities
export const sanitizeResponse = <T>(response: ApiResponse<T>): ApiResponse<T> => {
  const sanitized = { ...response };
  
  // Remove sensitive fields if present
  if (sanitized.meta?.requestId) {
    // Keep requestId as it's useful for debugging
  }
  
  return sanitized;
};

export const addResponseMetadata = <T>(
  response: ApiResponse<T>, 
  metadata: Record<string, any>
): ApiResponse<T> => {
  return {
    ...response,
    meta: {
      ...response.meta,
      ...metadata
    }
  };
};
