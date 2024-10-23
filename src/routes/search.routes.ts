import express, { Request, Response } from 'express';
import Route, { IRoute } from '../models/route.model';
import TaxiType, { ITaxiType } from '../models/taxiType.model';
import axios from 'axios';
import TaxiTypePrice, { ITaxiTypePriceModel } from '../models/price.model';

const router = express.Router();

router.post('/search', async (req: Request, res: Response) => {
  try {
    const { tripType, fromId, toId, pickupDate, returnDate, hourlyPackage, pickupCityId } = req.body;

    console.log(req.body)

    let route: IRoute | null = null
    let totalDistance: number = 0;
    let rates: any[] = [];

    if (tripType === 'Hourly Rental') {
      // Get the hourly rental package details
      const [hours, _, kms, __] = hourlyPackage.split(' ').map((value: string) => parseInt(value));
      totalDistance = kms; // For hourly rental, distance is based on kms

      // Fetch all taxi types
      const taxiTypes: ITaxiType[] = await TaxiType.find();

      // Calculate rates for each taxi type
      rates = taxiTypes.map((taxiType: ITaxiType) => {
        const originalPrice = hours * taxiType.price_hour;

        // Calculate discounted price based on discount_percentage
        const discountPercentage = taxiType.discount_percentage || 0;
        const discountedPrice = Math.ceil(originalPrice * ((100 - discountPercentage) / 100));

        return {
          taxiType: taxiType,
          originalPrice,
          discountedPrice,
        };
      });
    } else {
      // Find the route based on fromId and toId
      route = await Route.findOne({ from_id: fromId, to_id: toId, route_status: 'Active' });

      // Check if no route is found
      if (!route) {
        return res.json({ taxi_rates: [], route: null }); // Return empty taxi rates and null route
      }

      // Fetch settings
      const settingsResponse = await axios.get('https://api.bombaytaxico.com/settings/get');
      const settings = settingsResponse.data.settings;
      const minimumBillableKm = parseInt(settings.minimumBillableKm)
      if (!settings) return res.status(500).json({ msg: "Settings not found" });

      const isRoundTrip = tripType === 'Round Trip';
      const distance = isRoundTrip ? route.round_trip_km : route.one_way_trip_km;
      // Calculate the difference in days between pickupDate and returnDate for round trips
      const dateDifference = isRoundTrip ? Math.ceil(((new Date(returnDate) as any) - (new Date(pickupDate) as any)) / (1000 * 60 * 60 * 24)) : 0;
      // Multiply the distance by the date difference for round trips
      totalDistance = isRoundTrip ? Math.max((dateDifference + 1) * minimumBillableKm, distance) : distance;
      console.log("DISTANCE IS SEARCH", totalDistance)

      // Fetch all taxi type prices for the found route
      const taxiTypePrices: ITaxiTypePriceModel[] = await TaxiTypePrice.find({ route_id: route?._id, status: true }).populate({
        path: 'taxi_type_id',
        populate: { path: 'car_features' }
      });

      // Calculate rates for each taxi type
      rates = taxiTypePrices.map((taxiTypePrice: ITaxiTypePriceModel) => {
        const taxiType = taxiTypePrice.taxi_type_id as ITaxiType;
        const originalPrice = totalDistance * taxiTypePrice.price_km;

        // Calculate discounted price based on discount_percentage
        const discountPercentage = taxiTypePrice.taxi_type_id.discount_percentage || 0;
        const discountedPrice = Math.ceil(originalPrice * ((100 - discountPercentage) / 100));

        return {
          taxiType: taxiType,
          extraKmCharges: taxiTypePrice.extra_km_charges,
          originalPrice,
          discountedPrice,
        };
      });
    }

    res.json({ taxi_rates: rates, route: route, distance: totalDistance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
