// Import necessary libraries and modules
import { Request, Response } from 'express';
import City from '../models/city.model';

// Controller function for creating a From
export const createFrom = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract From details from the request body
        const { name } = req.body;

        // Create a new From instance
        const newCity = new City({
            name,
            // status defaults to 'Active'
        });

        // Save the From to the database
        await newCity.save();

        // Send a success response
        res.status(201).json({ message: 'From created successfully' });
    } catch (error) {
        // Handle errors and send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for getting all Froms with dynamic filtering
export const getAllCitys = async (req: Request, res: Response): Promise<void> => {
    try {
      // Dynamic filtering: construct filter object from query parameters
      const filter: Record<string, any> = {};
  
      for (const key in req.query) {
        if (Object.prototype.hasOwnProperty.call(req.query, key)) {
          filter[key] = req.query[key];
        }
      }
  
      // Fetch Froms from the database based on dynamic filtering
      const froms = await City.find(filter);
  
      // Send the Froms in the response
      res.status(200).json({ froms });
    } catch (error) {
      // Handle errors and send an error response
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

// Controller function for getting a single From by ID
export const getCityById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract From ID from the request parameters
        const { id } = req.params;

        // Find the From in the database based on the provided ID
        const city = await City.findById(id);

        // Check if the From exists
        if (!city) {
            res.status(404).json({ message: 'From not found' });
            return;
        }

        // Send the From in the response
        res.status(200).json({ from: city });
    } catch (error) {
        // Handle errors and send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for updating a From by ID
export const updateCityById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract From ID from the request parameters
        const { id } = req.params;

        // Extract updated From details from the request body
        const { name, status } = req.body;

        // Find the From in the database based on the provided ID
        const city = await City.findByIdAndUpdate(
            id,
            {
                name,
                status
            },
            { new: true } // Return the updated From
        );

        // Check if the From exists
        if (!city) {
            res.status(404).json({ message: 'From not found' });
            return;
        }

        // Send the updated From in the response
        res.status(200).json({ message: 'From updated successfully', city: city });
    } catch (error) {
        // Handle errors and send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for deleting a From by ID
export const deleteCityById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract From ID from the request parameters
        const { id } = req.params;

        // Find and delete the From in the database based on the provided ID
        const deletedCity = await City.findByIdAndDelete(id);

        // Check if the From exists
        if (!deletedCity) {
            res.status(404).json({ message: 'From not found' });
            return;
        }

        // Send a success response
        res.status(200).json({ message: 'From deleted successfully' });
    } catch (error) {
        // Handle errors and send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};