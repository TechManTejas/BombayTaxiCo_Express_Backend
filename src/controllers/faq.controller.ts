// Import necessary libraries and modules
import { Request, Response } from 'express';
import FAQ from '../models/faq.model';

// Controller function for creating a FAQ
export const createFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract FAQ details from the request body
    const { question, answer } = req.body;

    // Create a new FAQ instance
    const newFAQ = new FAQ({
      question,
      answer,
    });

    // Save the FAQ to the database
    await newFAQ.save();

    // Send a success response
    res.status(201).json({ message: 'FAQ created successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for getting all FAQs with dynamic filtering
export const getAllFAQs = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dynamic filtering: construct filter object from query parameters
    const filter: Record<string, any> = {};

    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        filter[key] = req.query[key];
      }
    }

    // Fetch FAQs from the database based on dynamic filtering
    const faqs = await FAQ.find(filter);

    // Send the FAQs in the response
    res.status(200).json({ faqs });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Controller function for getting a single FAQ by ID
export const getFAQById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract FAQ ID from the request parameters
    const { id } = req.params;

    // Find the FAQ in the database based on the provided ID
    const faq = await FAQ.findById(id);

    // Check if the FAQ exists
    if (!faq) {
      res.status(404).json({ message: 'FAQ not found' });
      return;
    }

    // Send the FAQ in the response
    res.status(200).json({ faq });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for updating a FAQ by ID
export const updateFAQById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract FAQ ID from the request parameters
    const { id } = req.params;

    // Extract updated FAQ details from the request body
    const { question, answer } = req.body;

    // Find the FAQ in the database based on the provided ID
    const faq = await FAQ.findByIdAndUpdate(
      id,
      {
        question,
        answer,
      },
      { new: true } // Return the updated FAQ
    );

    // Check if the FAQ exists
    if (!faq) {
      res.status(404).json({ message: 'FAQ not found' });
      return;
    }

    // Send the updated FAQ in the response
    res.status(200).json({ message: 'FAQ updated successfully', faq });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function for deleting a FAQ by ID
export const deleteFAQById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract FAQ ID from the request parameters
    const { id } = req.params;

    // Find and delete the FAQ in the database based on the provided ID
    const deletedFAQ = await FAQ.findByIdAndDelete(id);

    // Check if the FAQ exists
    if (!deletedFAQ) {
      res.status(404).json({ message: 'FAQ not found' });
      return;
    }

    // Send a success response
    res.status(200).json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
