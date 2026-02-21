import { IntercityAddonQuoteBreakdown } from './intercity-addon-quote.types';

const inr = (value: number): string => `INR ${value.toFixed(2)}`;

export const summarizeIntercityAddonQuote = (breakdown: IntercityAddonQuoteBreakdown): string => {
  return [
    `Base: ${inr(breakdown.baseCost)}`,
    `Route Adj: ${inr(breakdown.routeAdjustment)}`,
    `Passenger Adj: ${inr(breakdown.passengerAdjustment)}`,
    `Snack Kit: ${inr(breakdown.snackKitCost)}`,
    `Assistant: ${inr(breakdown.travelAssistantCost)}`,
    `Luggage Priority: ${inr(breakdown.luggagePriorityCost)}`,
    `Markup: ${inr(breakdown.markupAmount)}`,
    `Discount: ${inr(breakdown.discount)}`,
    `Service Fee: ${inr(breakdown.serviceFee)}`,
    `Total: ${inr(breakdown.total)}`,
  ].join(' | ');
};
