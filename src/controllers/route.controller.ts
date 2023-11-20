// Import necessary libraries and modules
import { Request, Response } from 'express';
import Route from '../models/route.model';

// Controller function for creating a Route
export const createRoute = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            from_id,
            to_id,
            one_way_cost,
            two_way_cost,
            round_trip_cost,
            hourly_rent,
            route_status,
        } = req.body;

        const newRoute = new Route({
            from_id,
            to_id,
            one_way_cost,
            two_way_cost,
            round_trip_cost,
            hourly_rent,
            route_status,
        });

        await newRoute.save();
        res.status(201).json({ message: 'Route created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for getting all Routes with dynamic filtering
export const getAllRoutes = async (req: Request, res: Response): Promise<void> => {
    try {
      // Dynamic filtering: construct filter object from query parameters
      const filter: Record<string, any> = {};
  
      for (const key in req.query) {
        if (Object.prototype.hasOwnProperty.call(req.query, key)) {
          filter[key] = req.query[key];
        }
      }
  
      // Fetch Routes from the database based on dynamic filtering
      const routes = await Route.find(filter);
  
      // Send the Routes in the response
      res.status(200).json({ routes });
    } catch (error) {
      // Handle errors and send an error response
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

// Controller function for getting all active Routes
export const getAllActiveRoutes = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeRoutes = await Route.find({ route_status: 'Active' });
        res.status(200).json({ activeRoutes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Controller function for getting a single Route by ID
export const getRouteById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const route = await Route.findById(id);

        if (!route) {
            res.status(404).json({ message: 'Route not found' });
            return;
        }

        res.status(200).json({ route });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for updating a Route by ID
export const updateRouteById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            from_id,
            to_id,
            one_way_cost,
            two_way_cost,
            round_trip_cost,
            hourly_rent,
            route_status,
        } = req.body;

        const route = await Route.findByIdAndUpdate(
            id,
            {
                from_id,
                to_id,
                one_way_cost,
                two_way_cost,
                round_trip_cost,
                hourly_rent,
                route_status,
            },
            { new: true }
        );

        if (!route) {
            res.status(404).json({ message: 'Route not found' });
            return;
        }

        res.status(200).json({ message: 'Route updated successfully', route });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for deleting a Route by ID
export const deleteRouteById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedRoute = await Route.findByIdAndDelete(id);

        if (!deletedRoute) {
            res.status(404).json({ message: 'Route not found' });
            return;
        }

        res.status(200).json({ message: 'Route deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};