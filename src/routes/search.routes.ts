import express, { Request, Response } from 'express';
import Route, { IRoute } from '../models/route.model';
import TaxiType, { ITaxiType } from '../models/taxiType.model';

const router = express.Router();

router.post('/search', async (req: Request, res: Response) => {
  try {
    const { tripType, fromId, toId, pickupDate, returnDate, hourlyPackage, pickupCityId } = req.body;

    console.log(req.body)

    let route: IRoute | null = null
    let totalDistance: number = 0;

    if (tripType === 'Hourly Rental') {
      // Get the hourly rental package details
      const [hours, _, kms, __] = hourlyPackage.split(' ').map((value: string) => parseInt(value));
      totalDistance = kms; // For hourly rental, distance is based on kms
      console.log(hours, kms)
    }


    if (tripType !== "Hourly Rental") {
      // Find the route based on fromId and toId
      route = await Route.findOne({ from_id: fromId, to_id: toId, route_status: 'Active' });

      // Check if no route is found
      if (!route) {
        return res.json({ taxi_rates: [], route: null }); // Return empty taxi rates and null route
      }

      const isRoundTrip = tripType === 'Round Trip';
      const distance = isRoundTrip ? route.round_trip_km : route.one_way_trip_km;
      // Calculate the difference in days between pickupDate and returnDate for round trips
      const dateDifference = isRoundTrip ? Math.ceil(((new Date(returnDate) as any) - (new Date(pickupDate) as any)) / (1000 * 60 * 60 * 24)) : 0;
      // Multiply the distance by the date difference for round trips
      totalDistance = isRoundTrip ? (distance / 2) * (dateDifference + 1) : distance;
    }

    // Get all taxi types
    const taxiTypes: ITaxiType[] = await TaxiType.find();

    // Calculate rates for each taxi type
    const rates = taxiTypes.map((taxiType: ITaxiType) => {

      const originalPrice = totalDistance * taxiType.price_km;
      // Calculate discounted price based on discount_percentage
      const discountPercentage = taxiType.discount_percentage || 0;
      const discountedPrice = originalPrice * ((100 - discountPercentage) / 100);

      return {
        taxiType: taxiType,
        originalPrice,
        discountedPrice,
      };
    });

    res.json({ taxi_rates: rates, route: route, distance: totalDistance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
