const express = require('express');
const router = express.Router();
const Subject = require('../models/subject');

// Crear una nueva asignatura
router.post('/', async (req, res) => {
  const { nombre_asignatura } = req.body;

  try {
    const newSubject = new Subject({ nombre_asignatura });
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
