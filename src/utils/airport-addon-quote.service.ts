import {
  AirportAddonQuoteRequest,
  AirportAddonQuoteResponse,
  AirportAddonQuoteRules,
  AirportAddonValidationResult,
} from './airport-addon-quote.types';
import { calculateAirportAddonQuoteBreakdown } from './airport-addon-quote.calculator';
import {
  cloneAirportAddonQuoteRules,
  defaultAirportAddonQuoteRules,
} from './airport-addon-quote.rules';
import {
  sanitizeAirportAddonQuoteRequest,
  validateAirportAddonQuoteRequest,
} from './airport-addon-quote.validators';

export interface AirportAddonQuoteServiceResult {
  success: boolean;
  message: string;
  data?: AirportAddonQuoteResponse;
  errors?: string[];
}

export class AirportAddonQuoteService {
  private static instance: AirportAddonQuoteService;
  private sequence = 0;

  static getInstance(): AirportAddonQuoteService {
    if (!AirportAddonQuoteService.instance) {
      AirportAddonQuoteService.instance = new AirportAddonQuoteService();
    }
    return AirportAddonQuoteService.instance;
  }

  validate(input: Partial<AirportAddonQuoteRequest>): AirportAddonValidationResult {
    const request = sanitizeAirportAddonQuoteRequest(input);
    return validateAirportAddonQuoteRequest(request);
  }

  generateQuote(
    input: Partial<AirportAddonQuoteRequest>,
    customRules?: Partial<AirportAddonQuoteRules>
  ): AirportAddonQuoteServiceResult {
    const request = sanitizeAirportAddonQuoteRequest(input);
    const validation = validateAirportAddonQuoteRequest(request);

    if (!validation.valid) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      };
    }

    const { breakdown, appliedCoupon } = calculateAirportAddonQuoteBreakdown(request, customRules);

    return {
      success: true,
      message: 'Airport addon quote generated',
      data: {
        quoteId: this.createQuoteId(),
        generatedAt: new Date().toISOString(),
        currency: 'INR',
        request,
        breakdown,
        appliedCoupon,
      },
    };
  }

  getDefaultRules(): AirportAddonQuoteRules {
    return cloneAirportAddonQuoteRules(defaultAirportAddonQuoteRules);
  }

  private createQuoteId(): string {
    this.sequence += 1;
    const seq = String(this.sequence).padStart(4, '0');
    const stamp = String(Date.now()).slice(-6);
    return `AAQ-${stamp}-${seq}`;
  }
}

export default AirportAddonQuoteService;
