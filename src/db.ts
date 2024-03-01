import mongoose from 'mongoose';
import { createStaffUserIfNotExists } from './controllers/admin.controller';

const MONGODB_URI = `${process.env.MONGODB_URI}` || 'default_connection_string';

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');

  const username = 'SUPERADMIN';
  const password = 'SUPERADMIN';

  createStaffUserIfNotExists(username, password)
    .then((createdUser) => {
      console.log('User created or already exists:', createdUser);
    })
    .catch((error) => {
      console.error('Error creating user:', error.message);
    });
});

export default mongoose;
