/**
 * Tests for authorizeRoles empty roles fix
 */
import { authorizeRoles } from '../utils/auth';

describe('authorizeRoles empty roles handling', () => {
  it('should allow any authenticated user when no roles specified', () => {
    const middleware = authorizeRoles();
    const req = { user: { role: 'viewer' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should still block unauthenticated users when no roles specified', () => {
    const middleware = authorizeRoles();
    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should still enforce roles when roles are specified', () => {
    const middleware = authorizeRoles('admin');
    const req = { user: { role: 'viewer' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
