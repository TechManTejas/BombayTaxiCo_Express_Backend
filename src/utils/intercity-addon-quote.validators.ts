import {
  AddonPlan,
  IntercityAddonQuoteRequest,
  IntercityAddonValidationResult,
  RouteBand,
} from './intercity-addon-quote.types';

const plans: AddonPlan[] = ['Saver', 'Flexi', 'Elite'];
const routeBands: RouteBand[] = ['SHORT', 'MEDIUM', 'LONG'];

const cleanText = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
};

const cleanInt = (value: unknown, min: number, max: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
};

const cleanBool = (value: unknown): boolean => value === true;

const cleanPlan = (value: unknown): AddonPlan => {
  if (typeof value !== 'string') return 'Saver';
  return (plans.includes(value as AddonPlan) ? value : 'Saver') as AddonPlan;
};

const cleanRouteBand = (value: unknown): RouteBand => {
  if (typeof value !== 'string') return 'SHORT';
  return (routeBands.includes(value as RouteBand) ? value : 'SHORT') as RouteBand;
};

export const sanitizeIntercityAddonQuoteRequest = (
  input: Partial<IntercityAddonQuoteRequest>
): IntercityAddonQuoteRequest => ({
  pickupCity: cleanText(input.pickupCity, 'Unknown'),
  addonPlan: cleanPlan(input.addonPlan),
  routeBand: cleanRouteBand(input.routeBand),
  trips: cleanInt(input.trips, 1, 20),
  passengers: cleanInt(input.passengers, 1, 10),
  includeSnackKit: cleanBool(input.includeSnackKit),
  includeTravelAssistant: cleanBool(input.includeTravelAssistant),
  includeLuggagePriority: cleanBool(input.includeLuggagePriority),
  markupPercent: Number.isFinite(Number(input.markupPercent)) ? Number(input.markupPercent) : 0,
  couponCode: typeof input.couponCode === 'string' ? input.couponCode.trim().toUpperCase() : undefined,
});

export const validateIntercityAddonQuoteRequest = (
  request: IntercityAddonQuoteRequest
): IntercityAddonValidationResult => {
  const errors: string[] = [];

  if (!request.pickupCity || request.pickupCity.trim().length < 2) {
    errors.push('Pickup city must have at least 2 characters.');
  }
  if (!plans.includes(request.addonPlan)) {
    errors.push('Invalid addon plan.');
  }
  if (!routeBands.includes(request.routeBand)) {
    errors.push('Invalid route band.');
  }
  if (!Number.isInteger(request.trips) || request.trips < 1 || request.trips > 20) {
    errors.push('Trips must be an integer between 1 and 20.');
  }
  if (!Number.isInteger(request.passengers) || request.passengers < 1 || request.passengers > 10) {
    errors.push('Passengers must be an integer between 1 and 10.');
  }

  const markup = request.markupPercent || 0;
  if (!Number.isFinite(markup) || markup < 0 || markup > 23) {
    errors.push('Markup percent must be between 0 and 23.');
  }

  return { valid: errors.length === 0, errors };
};
