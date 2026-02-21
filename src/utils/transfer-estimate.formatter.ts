import { TransferEstimateBreakdown } from './transfer-estimate.types';

const inr = (v: number): string => `INR ${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const line = (k: string, v: number): string => `${k}: ${inr(v)}`;

export const formatTransferEstimateBreakdown = (b: TransferEstimateBreakdown): string[] => [
  line('Base Distance Cost', b.baseDistanceCost),
  line('Demand Adjustment', b.demandAdjustment),
  line('Passenger Surcharge', b.passengerSurcharge),
  line('Luggage Surcharge', b.luggageSurcharge),
  line('Toll Cost', b.tollCost),
  line('Parking Cost', b.parkingCost),
  line('Markup Amount', b.markupAmount),
  line('Subtotal', b.subtotal),
  line('Discount', -b.discount),
  line('Service Charge', b.serviceCharge),
  line('Total', b.total),
];

export const summarizeTransferEstimate = (b: TransferEstimateBreakdown): string =>
  formatTransferEstimateBreakdown(b).join(' | ');
