// Import necessary libraries and modules
import express from 'express';
import { ProcessFieldCallback, generateCRUDRoutes } from '../utils/simplecrud.controller';
import TaxiType from '../models/taxiType.model';

// Create a router instance
const router = express.Router();

const processFieldCallback: ProcessFieldCallback = (documentData: any) => {
    if (documentData.car_features && typeof documentData.car_features === 'string') {
        documentData.car_features = JSON.parse(documentData.car_features);
    }
    return documentData
};

const uploadOptions = {
    fields: {
        image: {
            storagePath: './uploads/taxiTypes',
            maxCount: 5
        }
    }
};

router.use('/', generateCRUDRoutes(TaxiType, [], uploadOptions, processFieldCallback))

// Export the router
export default router;
