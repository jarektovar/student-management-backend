const express = require('express');
const router = express.Router();
const Program = require('../models/program');

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
    const newProgram = new Program({ nombre_programa, facultad_id });
    await newProgram.save();
    res.status(201).json(newProgram);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
