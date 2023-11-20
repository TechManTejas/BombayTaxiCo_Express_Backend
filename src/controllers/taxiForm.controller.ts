// Import necessary libraries and modules
import { Request, Response } from 'express';
import TaxiForm from '../models/taxiForm.model';

// Controller function for posting a taxi form response
export const postTaxiForm = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract taxi form details from the request body
    const { name, mobile_no, email_id, address, city_name, state_name, number_of_vehicles } = req.body;

    // Create a new taxi form instance
    const newTaxiForm = new TaxiForm({
      name,
      mobile_no,
      email_id,
      address,
      city_name,
      state_name,
      number_of_vehicles,
    });

    // Save the taxi form to the database
    await newTaxiForm.save();

    // Send a success response
    res.status(201).json({ message: 'Taxi form recorded successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for getting all taxi form responses with dynamic filtering
export const getAllTaxiForms = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dynamic filtering: construct filter object from query parameters
    const filter: Record<string, any> = {};

    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        filter[key] = req.query[key];
      }
    }

    // Fetch taxi form responses from the database based on dynamic filtering
    const taxiForms = await TaxiForm.find(filter);

    // Send the taxi form responses in the response
    res.status(200).json({ taxiForms });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
