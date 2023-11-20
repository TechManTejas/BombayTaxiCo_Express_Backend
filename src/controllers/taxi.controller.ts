// Import necessary libraries and modules
import { Request, Response } from 'express';
import Taxi from '../models/taxi.model';

// Controller function for creating a Taxi
export const createTaxi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taxi_type_id, taxi_no, rate_per_km, driving_license, car_features, fare_details, taxi_status } = req.body;

    const newTaxi = new Taxi({
      taxi_type_id,
      taxi_no,
      rate_per_km,
      driving_license,
      car_features,
      fare_details,
      taxi_status,
    });

    await newTaxi.save();
    res.status(201).json({ message: 'Taxi created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for getting all Taxis with dynamic filtering
export const getAllTaxis = async (req: Request, res: Response): Promise<void> => {
    try {
      // Dynamic filtering: construct filter object from query parameters
      const filter: Record<string, any> = {};
  
      for (const key in req.query) {
        if (Object.prototype.hasOwnProperty.call(req.query, key)) {
          filter[key] = req.query[key];
        }
      }
  
      // Fetch taxis from the database based on dynamic filtering
      const taxis = await Taxi.find(filter);
  
      // Send the taxis in the response
      res.status(200).json({ taxis });
    } catch (error) {
      // Handle errors and send an error response
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

// Controller function for getting a single Taxi by ID
export const getTaxiById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const taxi = await Taxi.findById(id);

    if (!taxi) {
      res.status(404).json({ message: 'Taxi not found' });
      return;
    }

    res.status(200).json({ taxi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for updating a Taxi by ID
export const updateTaxiById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { taxi_type_id, taxi_no, rate_per_km, driving_license, car_features, fare_details, taxi_status } = req.body;

    const taxi = await Taxi.findByIdAndUpdate(
      id,
      {
        taxi_type_id,
        taxi_no,
        rate_per_km,
        driving_license,
        car_features,
        fare_details,
        taxi_status,
      },
      { new: true }
    );

    if (!taxi) {
      res.status(404).json({ message: 'Taxi not found' });
      return;
    }

    res.status(200).json({ message: 'Taxi updated successfully', taxi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for deleting a Taxi by ID
export const deleteTaxiById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedTaxi = await Taxi.findByIdAndDelete(id);

    if (!deletedTaxi) {
      res.status(404).json({ message: 'Taxi not found' });
      return;
    }

    res.status(200).json({ message: 'Taxi deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
