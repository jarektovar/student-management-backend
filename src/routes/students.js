const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Obtener estudiantes con paginación
router.get('/', async (req, res) => {
  const page = parseInt(req.query.pageNumber) || 1;
  const limit = parseInt(req.query.pageSize) || 10;

  try {
    const students = await Student.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const totalStudents = await Student.countDocuments();

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
module.exports = router;
