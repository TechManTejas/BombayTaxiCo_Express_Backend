import express, { Request, Response, Router } from 'express';
import { Document, Model } from 'mongoose';

// Define the CRUD operations
export interface CRUDOperations<T extends Document> {
  create: OverrideCallback<T>;
  getAll: OverrideCallback<T>;
  getById: OverrideCallback<T>;
  updateById: OverrideCallback<T>;
  deleteById: OverrideCallback<T>;
}

// Define the override callback type
export type OverrideCallback<T extends Document> = (
  req: Request,
  res: Response,
  model: Model<T>
) => Promise<void>;

// Define the CRUD router generation function
export const generateCRUDRoutes = <T extends Document>(
  model: Model<T>,
  overrides: Partial<CRUDOperations<T>> = {},
  allowedMethods: string[] = [] // Added allowedMethods parameter
): Router => {
  const router = express.Router();

  // Create method
  if (allowedMethods.length === 0 || allowedMethods.includes('create')) {
    router.post('/', async (req, res) => {
      const overrideCreate = overrides.create || defaultCreate;
      await overrideCreate(req, res, model);
    });
  }

  // GetAll method
  if (allowedMethods.length === 0 || allowedMethods.includes('getAll')) {
    router.get('/', async (req, res) => {
      const overrideGetAll = overrides.getAll || defaultGetAll;
      await overrideGetAll(req, res, model);
    });
  }

  // GetById method
  if (allowedMethods.length === 0 || allowedMethods.includes('getById')) {
    router.get('/:id', async (req, res) => {
      const overrideGetById = overrides.getById || defaultGetById;
      await overrideGetById(req, res, model);
    });
  }

  // UpdateById method
  if (allowedMethods.length === 0 || allowedMethods.includes('updateById')) {
    router.put('/:id', async (req, res) => {
      const overrideUpdateById = overrides.updateById || defaultUpdateById;
      await overrideUpdateById(req, res, model);
    });
  }

  // DeleteById method
  if (allowedMethods.length === 0 || allowedMethods.includes('deleteById')) {
    router.delete('/:id', async (req, res) => {
      const overrideDeleteById = overrides.deleteById || defaultDeleteById;
      await overrideDeleteById(req, res, model);
    });
  }

  return router;
};

// Default CRUD methods if not overridden
const defaultCreate: OverrideCallback<Document> = async (req, res, model) => {
  // Default implementation for create
  const newItem = new model(req.body);
  await newItem.save();
  res.status(201).json({ message: 'Item created successfully', item: newItem });
};

const defaultGetAll: OverrideCallback<Document> = async (req, res, model) => {
  // Default implementation for getAll
  const items = await model.find();
  res.status(200).json({ items });
};

const defaultGetById: OverrideCallback<Document> = async (req, res, model) => {
  // Default implementation for getById
  const item = await model.findById(req.params.id);
  if (item) {
    res.status(200).json({ item });
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
};

const defaultUpdateById: OverrideCallback<Document> = async (req, res, model) => {
  // Default implementation for updateById
  const updatedItem = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (updatedItem) {
    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
};

const defaultDeleteById: OverrideCallback<Document> = async (req, res, model) => {
  // Default implementation for deleteById
  const deletedItem = await model.findByIdAndDelete(req.params.id);
  if (deletedItem) {
    res.status(200).json({ message: 'Item deleted successfully' });
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
};
