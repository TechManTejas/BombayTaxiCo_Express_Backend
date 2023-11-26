import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from './db';
import fs from 'fs';

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
import bookingRoutes from './routes/bookings.routes'

const app = express();

app.use(cors({
  origin: '*',
}));

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
app.use('/bookings', bookingRoutes);

app.get('/', (req, res) => {
  // Assuming your text file is named 'example.txt' in the root directory
  const filePath = '39DDA8E16A8150424FC88AD44C09AED0.txt';

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
