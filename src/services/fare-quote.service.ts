import { calculateFareBreakdown, defaultFareRuleSet } from '../utils/fare-quote.calculator';
import {
  FareQuoteRequest,
  FareQuoteResult,
  FareRuleSet,
  QuoteValidationResult,
} from '../utils/fare-quote.types';
import {
  sanitizeFareQuoteRequest,
  validateFareQuoteRequest,
} from '../utils/fare-quote.validators';

export interface FareQuoteResponse {
  success: boolean;
  message: string;
  data?: FareQuoteResult;
  errors?: string[];
}

export class FareQuoteService {
  private static instance: FareQuoteService;
  private static sequence = 0;

  private constructor() {}

  static getInstance(): FareQuoteService {
    if (!FareQuoteService.instance) {
      FareQuoteService.instance = new FareQuoteService();
    }
    return FareQuoteService.instance;
  }

  validate(request: Partial<FareQuoteRequest>): QuoteValidationResult {
    const sanitized = sanitizeFareQuoteRequest(request);
    return validateFareQuoteRequest(sanitized);
  }

  createQuote(
    request: Partial<FareQuoteRequest>,
    customRules?: Partial<FareRuleSet>
  ): FareQuoteResponse {
    const sanitized = sanitizeFareQuoteRequest(request);
    const validation = validateFareQuoteRequest(sanitized);

    if (!validation.valid) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      };
    }

    const { breakdown, appliedCoupon } = calculateFareBreakdown(sanitized, customRules);
    const quoteId = this.generateQuoteId();

    return {
      success: true,
      message: 'Quote generated successfully',
      data: {
        quoteId,
        request: sanitized,
        appliedCoupon,
        breakdown,
        generatedAt: new Date().toISOString(),
        currency: 'INR',
      },
    };
  }

  getDefaultRules(): FareRuleSet {
    return {
      ...defaultFareRuleSet,
      couponPercentByCode: {
        ...defaultFareRuleSet.couponPercentByCode,
      },
    };
  }

  private generateQuoteId(): string {
    FareQuoteService.sequence += 1;
    const prefix = String(Date.now()).slice(-6);
    const suffix = String(FareQuoteService.sequence).padStart(4, '0');
    return `Q-${prefix}-${suffix}`;
  }
}

export default FareQuoteService;
