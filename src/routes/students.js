const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Obtener estudiantes con paginación y filtros
router.get('/', async (req, res) => {
  const page = parseInt(req.query.pageNumber) || 1;
  const limit = parseInt(req.query.pageSize) || 10;
  const searchQuery = req.query.searchQuery || '';
  const sortOption = req.query.sortOption || 'nombre_name';

  try {
    const query = {
      $or: [
        { nombre_name: { $regex: searchQuery, $options: 'i' } },
        { apellido: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    const students = await Student.find(query)
      .sort({ [sortOption]: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-photo_estudiante');
    const totalStudents = await Student.countDocuments(query);

    res.json({
      students,
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching students' });
  }
});

// Obtener la foto de un estudiante por ID
router.get('/:id/photo', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('photo_estudiante');
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.json(student);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Obtener un estudiante por ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.json(student);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Actualizar un estudiante por ID
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.json(student);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Crear un nuevo estudiante
router.post('/', async (req, res) => {
  try {
    const { nombre_name, apellido, numero_documento, programa_id, photo_estudiante } = req.body;
    const newStudent = new Student({
      nombre_name,
      apellido,
      numero_documento,
      programa_id,
      photo_estudiante
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: 'Error registering student' });
  }
});

module.exports = router;
