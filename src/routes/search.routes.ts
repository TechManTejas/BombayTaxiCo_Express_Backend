import express, { Request, Response } from 'express';
import Route, { IRoute } from '../models/route.model';
import TaxiType, { ITaxiType } from '../models/taxiType.model';

const router = express.Router();

router.post('/search', async (req: Request, res: Response) => {
  try {
    const { tripType, fromId, toId, pickupDate, pickupTime } = req.body;
    console.log(req.body);

    // Find the route based on fromId and toId
    const route: IRoute | null = await Route.findOne({ from_id: fromId, to_id: toId, route_status: 'Active' });

    // Check if no route is found
    if (!route) {
      return res.json({ taxi_rates: [], route: null }); // Return empty taxi rates and null route
    }

    // Get all taxi types
    const taxiTypes: ITaxiType[] = await TaxiType.find();

    // Calculate rates for each taxi type
    const rates = taxiTypes.map((taxiType: ITaxiType) => {
      const distance = tripType === 'oneWay' ? route.one_way_trip_km : route.round_trip_km;
      const originalPrice = distance * taxiType.price_km;

      // Calculate discounted price based on discount_percentage
      const discountPercentage = taxiType.discount_percentage || 0;
      const discountedPrice = originalPrice * ((100 - discountPercentage) / 100);

      return {
        taxiType: taxiType,
        originalPrice,
        discountedPrice,
      };
    });

    res.json({ taxi_rates: rates, route: route });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
