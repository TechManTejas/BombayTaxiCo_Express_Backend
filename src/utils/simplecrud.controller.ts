import express, { Router, Request, Response } from 'express';
import mongoose, { Document, Model } from 'mongoose';

// Generic function to generate CRUD routes for a model
export const generateCRUDRoutes = <T extends Document>(model: Model<T>): Router => {
  const router = express.Router();

  // Create
  router.post('/', async (req: Request, res: Response) => {
    try {
      const newItem = new model(req.body);
      await newItem.save();
      res.status(201).json({ message: `${model.modelName} created successfully` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Read all with pagination, search, and filter
  router.get('/', async (req: Request, res: Response) => {
    try {
      // Pagination
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
      const skip = (page - 1) * pageSize;

      // Filter (you can customize this based on your model's properties)
      const filterQuery = req.query.filter;
      const filter = filterQuery ? { yourPropertyName: filterQuery } : {};

      // Combine search and filter queries
      const query = { ...filter };

      const items = await model
        .find(query)
        .skip(skip)
        .limit(pageSize);

      res.status(200).json({ [`${model.modelName.toLowerCase()}s`]: items });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Read by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await model.findById(id);

      if (!item) {
        res.status(404).json({ message: `${model.modelName} not found` });
        return;
      }

      res.status(200).json({ [model.modelName.toLowerCase()]: item });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Update by ID
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedItem = await model.findByIdAndUpdate(id, req.body, { new: true });

      if (!updatedItem) {
        res.status(404).json({ message: `${model.modelName} not found` });
        return;
      }

      res.status(200).json({ message: `${model.modelName} updated successfully`, [model.modelName.toLowerCase()]: updatedItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Delete by ID
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletedItem = await model.findByIdAndDelete(id);

      if (!deletedItem) {
        res.status(404).json({ message: `${model.modelName} not found` });
        return;
      }

      res.status(200).json({ message: `${model.modelName} deleted successfully` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  return router;
};
