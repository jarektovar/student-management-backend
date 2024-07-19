const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  nombre_programa: { type: String, required: true },
  facultad_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true }
});

const Program = mongoose.model('Program', programSchema);

module.exports = Program;
