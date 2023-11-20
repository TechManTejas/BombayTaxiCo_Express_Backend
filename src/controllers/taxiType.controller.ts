// Import necessary libraries and modules
import { Request, Response } from 'express';
import TaxiType from '../models/taxiType.model';

// Controller function for creating a TaxiType
export const createTaxiType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    const newTaxiType = new TaxiType({
      name,
    });

    await newTaxiType.save();
    res.status(201).json({ message: 'TaxiType created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for getting all TaxiTypes with dynamic filtering
export const getAllTaxiTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      // Dynamic filtering: construct filter object from query parameters
      const filter: Record<string, any> = {};
  
      for (const key in req.query) {
        if (Object.prototype.hasOwnProperty.call(req.query, key)) {
          filter[key] = req.query[key];
        }
      }
  
      // Fetch TaxiTypes from the database based on dynamic filtering
      const taxiTypes = await TaxiType.find(filter);
  
      // Send the TaxiTypes in the response
      res.status(200).json({ taxiTypes });
    } catch (error) {
      // Handle errors and send an error response
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

// Controller function for getting a single TaxiType by ID
export const getTaxiTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const taxiType = await TaxiType.findById(id);

    if (!taxiType) {
      res.status(404).json({ message: 'TaxiType not found' });
      return;
    }

    res.status(200).json({ taxiType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for updating a TaxiType by ID
export const updateTaxiTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const taxiType = await TaxiType.findByIdAndUpdate(
      id,
      {
        name,
      },
      { new: true }
    );

    if (!taxiType) {
      res.status(404).json({ message: 'TaxiType not found' });
      return;
    }

    res.status(200).json({ message: 'TaxiType updated successfully', taxiType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for deleting a TaxiType by ID
export const deleteTaxiTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedTaxiType = await TaxiType.findByIdAndDelete(id);

    if (!deletedTaxiType) {
      res.status(404).json({ message: 'TaxiType not found' });
      return;
    }

    res.status(200).json({ message: 'TaxiType deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
