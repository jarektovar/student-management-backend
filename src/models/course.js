const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  asignatura_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  nombre: { type: String, required: true },
  cupos_materia: { type: Number, required: true }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
