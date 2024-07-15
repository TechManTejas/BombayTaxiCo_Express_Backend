import { Schema, model, Document } from 'mongoose';
import { ITaxiType } from './taxiType.model';
import { IRoute } from './route.model';

// Define the TaxiTypePrice schema
export interface ITaxiTypePriceModel extends Document {
    route_id: IRoute;
    taxi_type_id: ITaxiType;
    price_km: number;
    extra_km_charges: number;
    status: boolean;
}

const taxiTypePriceSchema = new Schema<ITaxiTypePriceModel>({
    route_id: {
        type: Schema.Types.ObjectId,
        ref: 'Route',
        required: true,
    },
    taxi_type_id: {
        type: Schema.Types.ObjectId,
        ref: 'TaxiType',
        required: true,
    },
    price_km: {
        type: Number,
        required: true,
    },
    extra_km_charges: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: false
    },
});

// Create and export the TaxiTypePrice model
const TaxiTypePrice = model<ITaxiTypePriceModel>('TaxiTypePrice', taxiTypePriceSchema);
export default TaxiTypePrice;
