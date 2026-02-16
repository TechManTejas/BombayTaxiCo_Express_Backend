/**
 * Tests for processFieldCallback type and usage fix
 */
import express from 'express';
import { generateCRUDRoutes, ProcessFieldCallback } from '../utils/simplecrud.controller';

// Mock model
const mockModel = {
  modelName: 'Test',
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  save: jest.fn(),
  schema: { paths: {} }
} as any;

describe('processFieldCallback handling', () => {
  let router: express.Router;

  beforeEach(() => {
    router = generateCRUDRoutes(mockModel);
  });

  it('should handle callback that returns void', async () => {
    const voidCallback: ProcessFieldCallback = (data) => {
      data.processed = true;
      // Explicitly returns void
    };

    const routerWithVoidCallback = generateCRUDRoutes(mockModel, undefined, undefined, voidCallback);
    expect(routerWithVoidCallback).toBeDefined();
  });

  it('should handle callback that returns modified data', async () => {
    const returnCallback: ProcessFieldCallback = (data) => {
      return { ...data, processed: true };
    };

    const routerWithReturnCallback = generateCRUDRoutes(mockModel, undefined, undefined, returnCallback);
    expect(routerWithReturnCallback).toBeDefined();
  });

  it('should handle callback that returns undefined', async () => {
    const undefinedCallback: ProcessFieldCallback = (data) => {
      data.processed = true;
      return undefined;
    };

    const routerWithUndefinedCallback = generateCRUDRoutes(mockModel, undefined, undefined, undefinedCallback);
    expect(routerWithUndefinedCallback).toBeDefined();
  });
});
