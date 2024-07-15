const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const Student = require('../models/student');

// Obtener todas las materias con inscripciones y paginación
router.get('/', async (req, res) => {
  const { pageNumber = 1, pageSize = 10 } = req.query;
  const skip = (pageNumber - 1) * pageSize;

  try {
    const courses = await Course.find()
      .skip(skip)
      .limit(parseInt(pageSize))
      .populate('asignatura_id', 'nombre_asignatura')
      .populate({
        path: 'enrollments',
        populate: {
          path: 'estudiante_id',
          model: 'Student'
        }
      });

    const totalCourses = await Course.countDocuments();
    res.json({ courses, totalCourses });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
