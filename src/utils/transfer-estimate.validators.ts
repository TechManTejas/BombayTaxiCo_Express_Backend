import {
  TransferEstimateRequest,
  TransferEstimateValidationResult,
  TransferTier,
  DemandBand,
} from './transfer-estimate.types';

const tiers: TransferTier[] = ['Economy', 'Comfort', 'Premium'];
const bands: DemandBand[] = ['High', 'Normal', 'Low'];

const cleanText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

const cleanInt = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return 0;
};

const cleanBool = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }
  return false;
};

export const normalizeCoupon = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : undefined;
};

export const sanitizeTransferEstimateRequest = (
  input: Partial<TransferEstimateRequest>
): TransferEstimateRequest => ({
  sourceCity: cleanText(input.sourceCity),
  destinationCity: cleanText(input.destinationCity),
  tier: cleanText(input.tier) as TransferTier,
  demandBand: cleanText(input.demandBand) as DemandBand,
  distanceKm: cleanInt(input.distanceKm),
  passengers: cleanInt(input.passengers),
  luggageUnits: cleanInt(input.luggageUnits),
  includeToll: cleanBool(input.includeToll),
  includeParking: cleanBool(input.includeParking),
  markupPercent: typeof input.markupPercent === 'number' ? input.markupPercent : cleanInt(input.markupPercent),
  couponCode: normalizeCoupon(input.couponCode),
});

export const validateTransferEstimateRequest = (
  request: TransferEstimateRequest
): TransferEstimateValidationResult => {
  const errors: string[] = [];

  if (!request.sourceCity) errors.push('sourceCity is required');
  if (!request.destinationCity) errors.push('destinationCity is required');
  if (!tiers.includes(request.tier)) errors.push('tier must be Economy, Comfort, or Premium');
  if (!bands.includes(request.demandBand)) errors.push('demandBand must be High, Normal, or Low');

  if (!Number.isInteger(request.distanceKm) || request.distanceKm < 1 || request.distanceKm > 4000) {
    errors.push('distanceKm must be an integer between 1 and 4000');
  }

  if (!Number.isInteger(request.passengers) || request.passengers < 1 || request.passengers > 20) {
    errors.push('passengers must be an integer between 1 and 20');
  }

  if (!Number.isInteger(request.luggageUnits) || request.luggageUnits < 0 || request.luggageUnits > 30) {
    errors.push('luggageUnits must be an integer between 0 and 30');
  }

  const markup = request.markupPercent || 0;
  if (markup < 0 || markup > 25) {
    errors.push('markupPercent must be between 0 and 25');
  }

  return { valid: errors.length === 0, errors };
};
