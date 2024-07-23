const express = require('express');
const router = express.Router();
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const Student = require('../models/student');

// Inscribir un estudiante en una materia
router.post('/',  async (req, res) => {
  const { materia_id, estudiante_id } = req.body;

  try {
    const enrollment = new Enrollment({
      materia_id,
      estudiante_id
    });

    await enrollment.save();

    // Reducir el número de cupos en la materia
    const course = await Course.findById(materia_id);
    if (course.cupos_materia > 0) {
      course.cupos_materia -= 1;
      await course.save();
    } else {
      return res.status(400).json({ message: 'No more seats available in this course.' });
    }

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Inscribir estudiantes de forma masiva
router.post('/bulk-enroll', async (req, res) => {
  const { studentIds, courseIds } = req.body;
  try {
    for (const studentId of studentIds) {
      const randomCourseId = courseIds[Math.floor(Math.random() * courseIds.length)];
      const enrollment = new Enrollment({
        materia_id: randomCourseId,
        estudiante_id: studentId
      });

      await enrollment.save();

      // Reducir el número de cupos en la materia
      const course = await Course.findById(randomCourseId);
      if (course.cupos_materia > 0) {
        course.cupos_materia -= 1;
        await course.save();
      } else {
        return res.status(400).json({ message: 'No more seats available in this course.' });
      }
    }
    res.status(201).json({ message: 'Inscripciones realizadas exitosamente' });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
