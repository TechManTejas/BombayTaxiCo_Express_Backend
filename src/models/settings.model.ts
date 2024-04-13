// Import necessary libraries and modules
import { Schema, model, Document } from 'mongoose';

// Define the Settings schema
export interface ISettings extends Document {
    baseFare: string;
    gst: string;
    stateTollTax: string;
    vehiclesAndFuelCharges: string;
    onePickupAndDrop: string;
    parkingAndAirportEntry: string;
    waitingChargesPerMinute: string;
    nightChargePerDay: string;
    extraPickupDropCharges: string;
    advancePaymentPercentage: string;
    minimumBillableKm: number;
}

const settingsSchema = new Schema<ISettings>({
    baseFare: {
        type: String, // Change the type to String
        required: true,
    },
    gst: {
        type: String, // Change the type to String
        required: true,
    },
    stateTollTax: {
        type: String, // Change the type to String
        required: true,
    },
    vehiclesAndFuelCharges: {
        type: String, // Change the type to String
        required: true,
    },
    onePickupAndDrop: {
        type: String, // Change the type to String
        required: true,
    },
    parkingAndAirportEntry: {
        type: String, // Change the type to String
        required: true,
    },
    waitingChargesPerMinute: {
        type: String,
        required: true,
    },
    nightChargePerDay: {
        type: String,
        required: true,
    },
    extraPickupDropCharges: {
        type: String,
        required: true,
    },
    advancePaymentPercentage: {
        type: String,
        required: true,
    },
    minimumBillableKm: {
        type: Number,
        required: true,
    }
});

// Define the schema for the singleton document
const singletonSettingsSchema = new Schema(
    {
        _id: {
            type: String,
            default: 'singleton',
        },
        settings: {
            type: settingsSchema,
            required: true,
        },
    },
    { _id: false }
);

// Create and export the SingletonSettings model
const SingletonSettings = model<ISettings>('SingletonSettings', singletonSettingsSchema);
export default SingletonSettings;