const express = require('express');
const router = express.Router();
const Faculty = require('../models/faculty');

// Obtener todas las facultades
router.get('/', async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json(faculties);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Crear una nueva facultad
router.post('/', async (req, res) => {
  const { nombre_facultad } = req.body;

  try {
    const newFaculty = new Faculty({ nombre_facultad });
    await newFaculty.save();
    res.status(201).json(newFaculty);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
