import {
  TransferEstimateRequest,
  TransferEstimateResponse,
  TransferEstimateRules,
  TransferEstimateValidationResult,
} from './transfer-estimate.types';
import { calculateTransferEstimateBreakdown } from './transfer-estimate.calculator';
import { cloneTransferEstimateRules, defaultTransferEstimateRules } from './transfer-estimate.rules';
import { sanitizeTransferEstimateRequest, validateTransferEstimateRequest } from './transfer-estimate.validators';

export interface TransferEstimateServiceResult {
  success: boolean;
  message: string;
  data?: TransferEstimateResponse;
  errors?: string[];
}

export class TransferEstimateService {
  private static instance: TransferEstimateService;
  private sequence = 0;

  static getInstance(): TransferEstimateService {
    if (!TransferEstimateService.instance) {
      TransferEstimateService.instance = new TransferEstimateService();
    }
    return TransferEstimateService.instance;
  }

  validate(input: Partial<TransferEstimateRequest>): TransferEstimateValidationResult {
    const request = sanitizeTransferEstimateRequest(input);
    return validateTransferEstimateRequest(request);
  }

  generateQuote(
    input: Partial<TransferEstimateRequest>,
    customRules?: Partial<TransferEstimateRules>
  ): TransferEstimateServiceResult {
    const request = sanitizeTransferEstimateRequest(input);
    const validation = validateTransferEstimateRequest(request);

    if (!validation.valid) {
      return { success: false, message: 'Validation failed', errors: validation.errors };
    }

    const { breakdown, appliedCoupon } = calculateTransferEstimateBreakdown(request, customRules);

    return {
      success: true,
      message: 'Transfer estimate generated',
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

  getDefaultRules(): TransferEstimateRules {
    return cloneTransferEstimateRules(defaultTransferEstimateRules);
  }

  private createQuoteId(): string {
    this.sequence += 1;
    const seq = String(this.sequence).padStart(4, '0');
    const stamp = String(Date.now()).slice(-6);
    return `TQ-${stamp}-${seq}`;
  }
}

export default TransferEstimateService;
