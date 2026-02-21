import { AirportAddonQuoteBreakdown } from './airport-addon-quote.types';

const inr = (value: number): string => `INR ${value.toFixed(2)}`;

export const summarizeAirportAddonQuote = (breakdown: AirportAddonQuoteBreakdown): string => {
  const lines = [
    `Base: ${inr(breakdown.baseTripCost)}`,
    `Time Adj: ${inr(breakdown.timeBandAdjustment)}`,
    `Passenger Adj: ${inr(breakdown.passengerAdjustment)}`,
    `Meet & Greet: ${inr(breakdown.meetAndGreetCost)}`,
    `Fast Track: ${inr(breakdown.fastTrackCost)}`,
    `Priority: ${inr(breakdown.prioritySupportCost)}`,
    `Markup: ${inr(breakdown.markupAmount)}`,
    `Discount: ${inr(breakdown.discount)}`,
    `Fee: ${inr(breakdown.convenienceFee)}`,
    `Total: ${inr(breakdown.total)}`,
  ];

  return lines.join(' | ');
};
