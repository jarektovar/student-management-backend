const express = require('express');
const router = express.Router();
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const Student = require('../models/student');

// Inscribir un estudiante en una materia
router.post('/', async (req, res) => {
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

module.exports = router;
