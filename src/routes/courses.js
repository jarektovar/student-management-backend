const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');

// Obtener todas las materias con inscripciones y paginación
router.get('/', async (req, res) => {
  const { pageNumber = 1, pageSize = 10 } = req.query;
  const skip = (pageNumber - 1) * pageSize;

  try {
    const courses = await Course.find()
      .skip(skip)
      .limit(parseInt(pageSize));

    const totalCourses = await Course.countDocuments();

    // Añadir el conteo de inscripciones y IDs de los alumnos inscritos a cada curso
    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.find({ materia_id: course._id });
        const enrollmentsCount = enrollments.length;
        const studentIds = enrollments.map(enrollment => enrollment.estudiante_id);
        return { ...course.toObject(), enrollmentsCount, studentIds };
      })
    );

    res.json({ courses: coursesWithEnrollments, totalCourses });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
