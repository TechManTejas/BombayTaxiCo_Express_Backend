// Import necessary libraries and modules
import { Request, Response } from 'express';
import Driver from '../models/driver.model';

// Controller function for creating a Driver
export const createDriver = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, mobile_no, email_id, address, driving_license, driver_status } = req.body;

        const newDriver = new Driver({
            name,
            mobile_no,
            email_id,
            address,
            driving_license,
            driver_status,
        });

        await newDriver.save();
        res.status(201).json({ message: 'Driver created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for getting all Drivers
export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
    try {
        const filter: Record<string, any> = {};

        for (const key in req.query) {
            if (Object.prototype.hasOwnProperty.call(req.query, key)) {
                filter[key] = req.query[key];
            }
        }

        const drivers = await Driver.find(filter);
        res.status(200).json({ drivers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for getting a single Driver by ID
export const getDriverById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const driver = await Driver.findById(id);

        if (!driver) {
            res.status(404).json({ message: 'Driver not found' });
            return;
        }

        res.status(200).json({ driver });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for updating a Driver by ID
export const updateDriverById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, mobile_no, email_id, address, driving_license, driver_status } = req.body;

        const driver = await Driver.findByIdAndUpdate(
            id,
            {
                name,
                mobile_no,
                email_id,
                address,
                driving_license,
                driver_status,
            },
            { new: true }
        );

        if (!driver) {
            res.status(404).json({ message: 'Driver not found' });
            return;
        }

        res.status(200).json({ message: 'Driver updated successfully', driver });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for deleting a Driver by ID
export const deleteDriverById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedDriver = await Driver.findByIdAndDelete(id);

        if (!deletedDriver) {
            res.status(404).json({ message: 'Driver not found' });
            return;
        }

        res.status(200).json({ message: 'Driver deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
