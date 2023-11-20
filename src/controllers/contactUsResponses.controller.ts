// Import necessary libraries and modules
import { Request, Response } from 'express';
import ContactUsResponses from '../models/contactUsResponses.model';

// Controller function for posting a response
export const postContactUsResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract response details from the request body
    const { name, mobile_no, email_id, message } = req.body;

    // Create a new response instance
    const newResponse = new ContactUsResponses({
      name,
      mobile_no,
      email_id,
      message,
    });

    // Save the response to the database
    await newResponse.save();

    // Send a success response
    res.status(201).json({ message: 'Contact response recorded successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for getting all ContactUsResponses with dynamic filtering
export const getAllContactUsResponses = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dynamic filtering: construct filter object from query parameters
    const filter: Record<string, any> = {};

    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        filter[key] = req.query[key];
      }
    }

    // Fetch ContactUsResponses from the database based on dynamic filtering
    const responses = await ContactUsResponses.find(filter);

    // Send the ContactUsResponses in the response
    res.status(200).json({ responses });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
