import express, { Router } from 'express';
import * as InvoiceController from '../controllers/invoices.controller';
import { generateCRUDRoutes } from '../utils/simplecrud.controller';
import Invoice from '../models/invoice.model';

// Create a router instance
const router: Router = express.Router();

router.get('/user-invoices', InvoiceController.getUserInvoices);

router.use('/', generateCRUDRoutes(Invoice, [
  {
    path: 'booking',
    populate: [
      { path: 'user_id' },
      { 
        path: 'taxi_id',
        populate: {
          path: 'taxi_type_id' 
        }
      },
      { 
        path: 'route_id',
        populate: {
          path: 'from_id to_id',
          strictPopulate: false 
        }
      }
    ]
  },
]));

// Export the router
export default router;
