const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // Aumenta el tiempo de espera a 30 segundos
};

mongoose.connect(process.env.MONGO_URI, options)
  .then(() => {
    console.log('Connected to MongoDB');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
  });
