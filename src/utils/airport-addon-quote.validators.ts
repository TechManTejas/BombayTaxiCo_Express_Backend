import {
  AddonTier,
  AirportAddonQuoteRequest,
  AirportAddonValidationResult,
  TimeBand,
} from './airport-addon-quote.types';

const tiers: AddonTier[] = ['Basic', 'Comfort', 'Premium'];
const timeBands: TimeBand[] = ['DAY', 'EVENING', 'NIGHT'];

const cleanText = (v: unknown, fallback: string): string => {
  if (typeof v !== 'string') return fallback;
  const t = v.trim();
  return t.length > 0 ? t : fallback;
};

const cleanInt = (v: unknown, min: number, max: number): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
};

const cleanBool = (v: unknown): boolean => v === true;

const cleanTier = (v: unknown): AddonTier => {
  if (typeof v !== 'string') return 'Basic';
  return (tiers.includes(v as AddonTier) ? v : 'Basic') as AddonTier;
};

const cleanTimeBand = (v: unknown): TimeBand => {
  if (typeof v !== 'string') return 'DAY';
  return (timeBands.includes(v as TimeBand) ? v : 'DAY') as TimeBand;
};

export const sanitizeAirportAddonQuoteRequest = (
  input: Partial<AirportAddonQuoteRequest>
): AirportAddonQuoteRequest => ({
  pickupCity: cleanText(input.pickupCity, 'Unknown'),
  addonTier: cleanTier(input.addonTier),
  timeBand: cleanTimeBand(input.timeBand),
  trips: cleanInt(input.trips, 1, 30),
  passengers: cleanInt(input.passengers, 1, 12),
  includeMeetAndGreet: cleanBool(input.includeMeetAndGreet),
  includeFastTrack: cleanBool(input.includeFastTrack),
  includePrioritySupport: cleanBool(input.includePrioritySupport),
  markupPercent: Number.isFinite(Number(input.markupPercent)) ? Number(input.markupPercent) : 0,
  couponCode: typeof input.couponCode === 'string' ? input.couponCode.trim().toUpperCase() : undefined,
});

export const validateAirportAddonQuoteRequest = (
  request: AirportAddonQuoteRequest
): AirportAddonValidationResult => {
  const errors: string[] = [];

  if (!request.pickupCity || request.pickupCity.trim().length < 2) {
    errors.push('Pickup city must have at least 2 characters.');
  }
  if (!tiers.includes(request.addonTier)) {
    errors.push('Invalid addon tier.');
  }
  if (!timeBands.includes(request.timeBand)) {
    errors.push('Invalid time band.');
  }
  if (!Number.isInteger(request.trips) || request.trips < 1 || request.trips > 30) {
    errors.push('Trips must be an integer between 1 and 30.');
  }
  if (!Number.isInteger(request.passengers) || request.passengers < 1 || request.passengers > 12) {
    errors.push('Passengers must be an integer between 1 and 12.');
  }

  const markup = request.markupPercent || 0;
  if (!Number.isFinite(markup) || markup < 0 || markup > 22) {
    errors.push('Markup percent must be between 0 and 22.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
