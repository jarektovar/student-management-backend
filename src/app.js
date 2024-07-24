const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Aumentar el límite de carga
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware
app.use(cors());

// Importar rutas
const studentRoutes = require('./routes/students');
const subjectRoutes = require('./routes/subjects');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const authRoutes = require('./routes/auth');
const programRoutes = require('./routes/programs');

// Usar rutas
app.use('/api/estudiantes', studentRoutes);
app.use('/api/asignaturas', subjectRoutes);
app.use('/api/materias', courseRoutes);
app.use('/api/inscripciones', enrollmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/programas', programRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
