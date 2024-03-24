import { Request, Response } from 'express';
import Invoice from '../models/invoice.model';
import jwt from 'jsonwebtoken';
import { Query } from 'mongoose';

// Function to get bookings associated with the user with pagination, search, and filter
export const getUserInvoices = async (req: Request, res: Response) => {
    try {
        // Extract the token from the request headers
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        // Decode the token to get user information
        const decodedToken: any = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`); // Replace 'your_secret_key' with your actual secret key

        // Get user ID from decoded token
        const userId = decodedToken.userId;

        // Pagination
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
        const skip = (page - 1) * pageSize;

        // Filter (customize this based on your model's properties)
        const filterQuery: any = req.query.filter;
        const filter = filterQuery ? JSON.parse(filterQuery) : {};

        // Search
        const searchQuery = req.query.search as string;
        const searchFilter: Record<string, any> = {};

        if (searchQuery) {
            const modelProperties = Object.keys(Invoice.schema.paths); // Assuming 'Booking' is the model for bookings

            const orArray = modelProperties
                .filter((property) => {
                    const propertyType = Invoice.schema.paths[property]?.instance;
                    return propertyType === 'String';
                })
                .map((property) => {
                    const regexFilter = { [property]: { $regex: new RegExp(searchQuery, 'i') } };
                    return regexFilter;
                });

            // Add the $or array to the search filter
            searchFilter.$or = orArray;
        }

        const populateOptions = [
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
        ];

        const populationQuery = populateOptions.map((option) => ({ path: option.path, populate: option.populate }));
        const query = { user_id: userId, ...filter, ...searchFilter };
        const itemsQuery = Invoice.find(query).lean().populate(populationQuery) as Query<any[], any, {}>;
        const totalCount = await Invoice.countDocuments(query);
        const items = await itemsQuery.skip(skip).limit(pageSize);

        res.status(200).json({ invoices: items, total: totalCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

