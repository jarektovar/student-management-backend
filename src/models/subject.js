const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  nombre_asignatura: { type: String, required: true }
});

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
