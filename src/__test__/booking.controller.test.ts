import { Request, Response } from 'express';
import { reassignTaxiDriver } from '../../controllers/booking.controller';
import Booking from '../../models/booking.model';
import Driver from '../../models/driver.model';
import Taxi from '../../models/taxi.model';

// Mock dependencies
jest.mock('../../models/booking.model');
jest.mock('../../models/driver.model');
jest.mock('../../models/taxi.model');

describe('Booking Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {
        booking_id: 'booking123',
        driver_id: 'driver123',
        taxi_id: 'taxi123'
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reassignTaxiDriver', () => {
    it('should reassign taxi and driver successfully', async () => {
      // Mock Booking.startSession
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn()
      };
      
      (Booking.startSession as jest.Mock).mockResolvedValue(mockSession);

      // Mock current booking
      const mockCurrentBooking = {
        driver_id: 'oldDriver123',
        taxi_id: 'oldTaxi123'
      };
      
      (Booking.findById as jest.Mock).mockResolvedValue(mockCurrentBooking);

      // Mock updated booking
      const mockUpdatedBooking = {
        _id: 'booking123',
        route_id: {
          from_id: { name: 'Mumbai' },
          to_id: { name: 'Pune' }
        },
        trip_type: 'OneWay',
        taxi_id: {
          taxi_type_id: { name: 'Sedan' }
        },
        user_id: {
          email_id: 'test@example.com'
        }
      };

      (Booking.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedBooking);

      // Mock driver and taxi updates
      (Driver.findByIdAndUpdate as jest.Mock).mockResolvedValue({ assigned_trips: [] });
      (Taxi.findByIdAndUpdate as jest.Mock).mockResolvedValue({ assigned_trips: [] });

      await reassignTaxiDriver(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Assignment successful, Booking Confirm"
      });
    });

    it('should handle errors during reassignment', async () => {
      // Mock session
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn()
      };
      
      (Booking.startSession as jest.Mock).mockResolvedValue(mockSession);

      // Mock error during booking update
      (Booking.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await reassignTaxiDriver(mockReq as Request, mockRes as Response);

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Error assigning taxi and driver"
      });
    });
  });
});
