import express, { Router, Request, Response, NextFunction } from 'express';
import { Document, Model, PopulateOptions, Query } from 'mongoose';
import fs from 'fs';
import multer, { Field } from 'multer';

interface UploadFieldOptions {
  storagePath: string;
  maxCount?: number;
}

interface UploadOptions {
  fields: Record<string, UploadFieldOptions>;
}

export type ProcessFieldCallback = (documentData: Record<string, any>) => void;

// Generic function to generate CRUD routes for a model
export const generateCRUDRoutes = <T extends Document>(
  model: Model<T>,
  population?: PopulateOptions[],
  uploadOptions?: UploadOptions,
  processFieldCallback?: ProcessFieldCallback
): Router => {
  const router = express.Router();

  const multerFields: Field[] = uploadOptions ? Object.entries(uploadOptions.fields).map(([fieldName, options]) => {
    return { name: fieldName, maxCount: options.maxCount ?? 1 }; // Default maxCount to 1 if not specified
  }) : [];

  const upload = uploadOptions ? multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const fieldOptions = uploadOptions.fields[file.fieldname];
        if (fieldOptions) {
          const path = fieldOptions.storagePath;
          fs.mkdirSync(path, { recursive: true });
          cb(null, path);
        }
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    })
  }).fields(multerFields) : (req: Request, res: Response, next: NextFunction) => next();

  // Create
  router.post('/', upload, async (req: Request, res: Response) => {
    try {
      var documentData = { ...req.body };
      if (req.files) {
        Object.entries(req.files as { [fieldname: string]: Express.Multer.File[] }).forEach(([field, files]) => {
          if (files && files.length > 0) {
            documentData[field] = files.map(file => file.path)[0];
          }
        });
      }

      if (processFieldCallback) {
        documentData = processFieldCallback(documentData);
      }

      const newItem = new model(documentData);
      await newItem.save();
      res.status(201).json(newItem);
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
      const filterQuery: any = req.query.filter;
      const filter = filterQuery ? JSON.parse(filterQuery) : {};

      // Search
      const searchQuery = req.query.search as string;
      const searchFilter: Record<string, any> = {};

      if (searchQuery) {
        const modelProperties = Object.keys(model.schema.paths);

        const orArray = modelProperties
          .filter((property) => {
            const propertyType = model.schema.paths[property]?.instance;
            return propertyType === 'String';
          })
          .map((property) => {
            const regexFilter = { [property]: { $regex: new RegExp(searchQuery, 'i') } };
            return regexFilter;
          });

        // Add the $or array to the search filter
        searchFilter.$or = orArray;
      }

      // Combine search and filter queries
      const query = { ...filter, ...searchFilter };

      let itemsQuery: Query<T[], T, {}>;

      // Populate specified attributes
      if (population) {
        itemsQuery = model.find(query).populate(population) as Query<T[], T, {}>;
      } else {
        itemsQuery = model.find(query) as Query<T[], T, {}>;
      }

      // Fetch total count without pagination
      const totalCount = await model.countDocuments(query);

      const items = await itemsQuery
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 });

      console.log(items)

      res.status(200).json({ [`${model.modelName.toLowerCase()}s`]: items, total: totalCount });
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
  router.put('/:id', upload, async (req: Request, res: Response) => {
    try {
      var documentData = { ...req.body };
      if (req.files) {
        Object.entries(req.files as { [fieldname: string]: Express.Multer.File[] }).forEach(([field, files]) => {
          if (files.length > 0) {
            documentData[field] = files.map(file => file.path)[0];
          }
        });
      }

      if (processFieldCallback) {
        documentData = processFieldCallback(documentData);
      }

      const updatedItem = await model.findByIdAndUpdate(req.params.id, documentData, { new: true });
      if (!updatedItem) {
        res.status(404).json({ message: `${model.modelName} not found` });
        return;
      }
      res.status(200).json(updatedItem);
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
