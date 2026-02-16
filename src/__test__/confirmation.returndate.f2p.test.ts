/**
 * Tests for confirmation email return_date null handling
 */
import confirmationEmail from '../email/confirmation';

describe('confirmationEmail return_date handling', () => {
  it('should handle null return_date gracefully', () => {
    const bookingDetails = {
      trip_type: 'One-Way Trip',
      journey: 'Mumbai to Pune',
      taxi: 'Sedan',
      pickup_address: 'Andheri, Mumbai',
      drop_address: 'Pune Station',
      pick_up_date: new Date('2025-01-15'),
      pick_up_time: '10:00 AM',
      return_date: null
    };

    const html = confirmationEmail(bookingDetails);
    expect(html).toContain('N/A');
    expect(html).not.toContain('Cannot read properties of null');
  });

  it('should handle undefined return_date gracefully', () => {
    const bookingDetails = {
      trip_type: 'One-Way Trip',
      journey: 'Mumbai to Pune',
      taxi: 'Sedan',
      pickup_address: 'Andheri, Mumbai',
      drop_address: 'Pune Station',
      pick_up_date: new Date('2025-01-15'),
      pick_up_time: '10:00 AM',
      return_date: undefined
    };

    const html = confirmationEmail(bookingDetails);
    expect(html).toContain('N/A');
    expect(html).not.toContain('Cannot read properties of undefined');
  });

  it('should still work with valid return_date', () => {
    const bookingDetails = {
      trip_type: 'Round Trip',
      journey: 'Mumbai to Pune',
      taxi: 'Sedan',
      pickup_address: 'Andheri, Mumbai',
      drop_address: 'Pune Station',
      pick_up_date: new Date('2025-01-15'),
      pick_up_time: '10:00 AM',
      return_date: new Date('2025-01-17')
    };

    const html = confirmationEmail(bookingDetails);
    expect(html).toContain('Jan 17 2025');
    expect(html).not.toContain('N/A');
  });
});
