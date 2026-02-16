/**
 * Tests for isValidObjectId whitespace trimming fix
 */
import { isValidObjectId } from '../utils/validators';

describe('isValidObjectId whitespace trimming', () => {
  it('should accept valid ObjectId with leading whitespace', () => {
    expect(isValidObjectId(' 507f1f77bcf86cd799439011')).toBe(true);
  });

  it('should accept valid ObjectId with trailing whitespace', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011 ')).toBe(true);
  });

  it('should accept valid ObjectId with both leading and trailing whitespace', () => {
    expect(isValidObjectId('  507f1f77bcf86cd799439011  ')).toBe(true);
  });

  it('should reject whitespace-only string', () => {
    expect(isValidObjectId('   ')).toBe(false);
  });

  it('should still reject invalid ObjectId', () => {
    expect(isValidObjectId('not-an-id')).toBe(false);
  });
});
