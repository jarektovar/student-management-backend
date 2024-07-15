const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  materia_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  estudiante_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
