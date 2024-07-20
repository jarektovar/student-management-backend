const express = require('express');
const router = express.Router();
const Program = require('../models/program');
const Faculty = require('../models/faculty');
const mongoose = require('mongoose');

// Obtener todos los programas
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find().populate('facultad_id');
    res.json(programs);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Crear un nuevo programa
router.post('/', async (req, res) => {
  const { nombre_programa, facultad_id } = req.body;

  try {
    // Verificar si facultad_id es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(facultad_id)) {
      return res.status(400).json({ message: 'facultad_id no es válido' });
    }

    // Verificar si la facultad existe
    const existingFaculty = await Faculty.findById(facultad_id);
    if (!existingFaculty) {
      return res.status(404).json({ message: 'La facultad no existe' });
    }

    const newProgram = new Program({ nombre_programa, facultad_id });
    await newProgram.save();
    res.status(201).json(newProgram);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
