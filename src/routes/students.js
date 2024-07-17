// routes/students.js
const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Obtener estudiantes con paginación
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

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

module.exports = router;
