import { FareQuoteRequest, QuoteValidationResult } from './fare-quote.types';

const isValidTime24Hr = (value: string): boolean => {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
};

const isNonEmptyText = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const sanitizeCityName = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

export const normalizeCouponCode = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : undefined;
};

export const sanitizeFareQuoteRequest = (input: Partial<FareQuoteRequest>): FareQuoteRequest => {
  return {
    pickupCity: sanitizeCityName(input.pickupCity || ''),
    dropCity: sanitizeCityName(input.dropCity || ''),
    tripType: (input.tripType || 'One-Way Trip') as FareQuoteRequest['tripType'],
    pickupTime: typeof input.pickupTime === 'string' ? input.pickupTime.trim() : '',
    distanceKm: typeof input.distanceKm === 'number' ? input.distanceKm : undefined,
    durationHours: typeof input.durationHours === 'number' ? input.durationHours : undefined,
    passengers: typeof input.passengers === 'number' ? input.passengers : 0,
    largeBags: typeof input.largeBags === 'number' ? input.largeBags : 0,
    couponCode: normalizeCouponCode(input.couponCode),
  };
};

export const validateFareQuoteRequest = (request: FareQuoteRequest): QuoteValidationResult => {
  const errors: string[] = [];

  if (!isNonEmptyText(request.pickupCity)) {
    errors.push('pickupCity is required');
  }

  if (!isNonEmptyText(request.dropCity)) {
    errors.push('dropCity is required');
  }

  if (request.pickupCity === request.dropCity && request.tripType === 'One-Way Trip') {
    errors.push('pickupCity and dropCity must be different for one-way trips');
  }

  if (!['One-Way Trip', 'Round Trip', 'Hourly Rental'].includes(request.tripType)) {
    errors.push('tripType must be One-Way Trip, Round Trip, or Hourly Rental');
  }

  if (!isValidTime24Hr(request.pickupTime)) {
    errors.push('pickupTime must be in HH:MM format');
  }

  if (!Number.isInteger(request.passengers) || request.passengers < 1 || request.passengers > 7) {
    errors.push('passengers must be an integer between 1 and 7');
  }

  if (!Number.isInteger(request.largeBags) || request.largeBags < 0 || request.largeBags > 10) {
    errors.push('largeBags must be an integer between 0 and 10');
  }

  if (request.tripType === 'Hourly Rental') {
    if (typeof request.durationHours !== 'number' || request.durationHours <= 0) {
      errors.push('durationHours must be greater than 0 for hourly rentals');
    }
  } else {
    if (typeof request.distanceKm !== 'number' || request.distanceKm <= 0) {
      errors.push('distanceKm must be greater than 0 for distance-based trips');
    }
  }

  if (typeof request.distanceKm === 'number' && request.distanceKm > 2000) {
    errors.push('distanceKm is unrealistically high');
  }

  if (typeof request.durationHours === 'number' && request.durationHours > 24) {
    errors.push('durationHours cannot exceed 24');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
