import {
  IntercityAddonQuoteRequest,
  IntercityAddonQuoteResponse,
  IntercityAddonQuoteRules,
  IntercityAddonValidationResult,
} from './intercity-addon-quote.types';
import { calculateIntercityAddonQuoteBreakdown } from './intercity-addon-quote.calculator';
import {
  cloneIntercityAddonQuoteRules,
  defaultIntercityAddonQuoteRules,
} from './intercity-addon-quote.rules';
import {
  sanitizeIntercityAddonQuoteRequest,
  validateIntercityAddonQuoteRequest,
} from './intercity-addon-quote.validators';

export interface IntercityAddonQuoteServiceResult {
  success: boolean;
  message: string;
  data?: IntercityAddonQuoteResponse;
  errors?: string[];
}

export class IntercityAddonQuoteService {
  private static instance: IntercityAddonQuoteService;
  private sequence = 0;

  static getInstance(): IntercityAddonQuoteService {
    if (!IntercityAddonQuoteService.instance) {
      IntercityAddonQuoteService.instance = new IntercityAddonQuoteService();
    }
    return IntercityAddonQuoteService.instance;
  }

  validate(input: Partial<IntercityAddonQuoteRequest>): IntercityAddonValidationResult {
    const request = sanitizeIntercityAddonQuoteRequest(input);
    return validateIntercityAddonQuoteRequest(request);
  }

  generateQuote(
    input: Partial<IntercityAddonQuoteRequest>,
    customRules?: Partial<IntercityAddonQuoteRules>
  ): IntercityAddonQuoteServiceResult {
    const request = sanitizeIntercityAddonQuoteRequest(input);
    const validation = validateIntercityAddonQuoteRequest(request);

    if (!validation.valid) {
      return { success: false, message: 'Validation failed', errors: validation.errors };
    }

    const { breakdown, appliedCoupon } = calculateIntercityAddonQuoteBreakdown(request, customRules);

    return {
      success: true,
      message: 'Intercity addon quote generated',
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

  getDefaultRules(): IntercityAddonQuoteRules {
    return cloneIntercityAddonQuoteRules(defaultIntercityAddonQuoteRules);
  }

  private createQuoteId(): string {
    this.sequence += 1;
    const seq = String(this.sequence).padStart(4, '0');
    const stamp = String(Date.now()).slice(-6);
    return `ICQ-${stamp}-${seq}`;
  }
}

export default IntercityAddonQuoteService;
