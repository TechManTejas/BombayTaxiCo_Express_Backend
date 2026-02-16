/**
 * Tests for isValidBookingStatus and isValidTripType whitespace trimming fix
 */
import { isValidBookingStatus, isValidTripType, BookingStatus, TripType } from '../models/booking.model';

describe('isValidBookingStatus whitespace trimming', () => {
  it('should accept status with trailing whitespace', () => {
    expect(isValidBookingStatus('New ')).toBe(true);
  });

  it('should accept status with leading whitespace', () => {
    expect(isValidBookingStatus(' Confirmed')).toBe(true);
  });

  it('should accept status with both leading and trailing whitespace', () => {
    expect(isValidBookingStatus('  Cancelled  ')).toBe(true);
  });

  it('should still reject invalid status', () => {
    expect(isValidBookingStatus('InvalidStatus')).toBe(false);
  });

  it('should reject whitespace-only string', () => {
    expect(isValidBookingStatus('   ')).toBe(false);
  });
});

describe('isValidTripType whitespace trimming', () => {
  it('should accept trip type with trailing whitespace', () => {
    expect(isValidTripType('One-Way Trip ')).toBe(true);
  });

  it('should accept trip type with leading whitespace', () => {
    expect(isValidTripType(' Round Trip')).toBe(true);
  });

  it('should still reject invalid trip type', () => {
    expect(isValidTripType('InvalidTrip')).toBe(false);
  });
});
