// Import necessary libraries and modules
import { Request, Response } from 'express';
import To from '../models/to.model';

// Controller function for creating a To
export const createTo = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract To details from the request body
    const { name } = req.body;

    // Create a new To instance
    const newTo = new To({
      name,
      // status defaults to 'Active'
    });

    // Save the To to the database
    await newTo.save();

    // Send a success response
    res.status(201).json({ message: 'To created successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for getting all Tos with dynamic filtering
export const getAllTos = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dynamic filtering: construct filter object from query parameters
    const filter: Record<string, any> = {};

    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        filter[key] = req.query[key];
      }
    }

    // Fetch Tos from the database based on dynamic filtering
    const tos = await To.find(filter);

    // Send the Tos in the response
    res.status(200).json({ tos });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for getting a single To by ID
export const getToById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract To ID from the request parameters
    const { id } = req.params;

    // Find the To in the database based on the provided ID
    const to = await To.findById(id);

    // Check if the To exists
    if (!to) {
      res.status(404).json({ message: 'To not found' });
      return;
    }

    // Send the To in the response
    res.status(200).json({ to });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for updating a To by ID
export const updateToById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract To ID from the request parameters
    const { id } = req.params;

    // Extract updated To details from the request body
    const { name } = req.body;

    // Find the To in the database based on the provided ID
    const to = await To.findByIdAndUpdate(
      id,
      {
        name,
      },
      { new: true } // Return the updated To
    );

    // Check if the To exists
    if (!to) {
      res.status(404).json({ message: 'To not found' });
      return;
    }

    // Send the updated To in the response
    res.status(200).json({ message: 'To updated successfully', to });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for deleting a To by ID
export const deleteToById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract To ID from the request parameters
    const { id } = req.params;

    // Find and delete the To in the database based on the provided ID
    const deletedTo = await To.findByIdAndDelete(id);

    // Check if the To exists
    if (!deletedTo) {
      res.status(404).json({ message: 'To not found' });
      return;
    }

    // Send a success response
    res.status(200).json({ message: 'To deleted successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
