const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nombre_name: { type: String, required: true },
  apellido: { type: String, required: true },
  numero_documento: { type: String, required: true, unique: true },
  photo_estudiante: { type: String },
  programa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  fecha_creacion: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
