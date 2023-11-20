import 'dotenv/config';
import express from 'express';
import mongoose from './db';

// Routes 
import userRoutes from './routes/userRoutes.routes';
import contactUsResponsesRoutes from './routes/contactUsResponses.routes';
import taxiFormRoutes from './routes/taxiForm.routes'; 
import faqRoutes from './routes/faq.routes';
import fromRoutes from './routes/from.routes';
import toRoutes from './routes/to.routes';
import couponRoutes from './routes/coupon.routes';
import routeRoutes from './routes/route.routes';
import taxiTypeRoutes from './routes/taxiType.routes';
import taxiRoutes from './routes/taxi.routes';
import driverRoutes from './routes/driver.routes';

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());
app.use('/users', userRoutes);
app.use('/contact-us', contactUsResponsesRoutes);
app.use('/taxi-forms', taxiFormRoutes);
app.use('/faqs', faqRoutes);
app.use('/froms', fromRoutes);
app.use('/tos', toRoutes);
app.use('/coupons', couponRoutes);
app.use('/routes', routeRoutes);
app.use('/taxi-types', taxiTypeRoutes);
app.use('/taxis', taxiRoutes); 
app.use('/drivers', driverRoutes); 

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
