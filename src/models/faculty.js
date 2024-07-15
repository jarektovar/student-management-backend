const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  nombre_facultad: { type: String, required: true }
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;
