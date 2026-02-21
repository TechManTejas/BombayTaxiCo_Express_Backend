import { Request, Response } from 'express';
import FareQuoteService from '../services/fare-quote.service';

const fareQuoteService = FareQuoteService.getInstance();

export const generateFareQuote = (req: Request, res: Response) => {
  try {
    const result = fareQuoteService.createQuote(req.body || {});

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate fare quote',
      errors: [error?.message || 'Unknown error'],
    });
  }
};

export const getFareQuoteHealth = (_req: Request, res: Response) => {
  const rules = fareQuoteService.getDefaultRules();
  return res.status(200).json({
    success: true,
    message: 'Fare quote service is healthy',
    data: {
      service: 'fare-quote',
      couponCount: Object.keys(rules.couponPercentByCode).length,
      minimumFare: rules.minimumFare,
    },
  });
};
