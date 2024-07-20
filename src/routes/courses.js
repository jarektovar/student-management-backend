const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');

router.get('/', auth, roles('admin'), async (req, res) => {
  const { pageNumber = 1, pageSize = 10 } = req.query;
  const skip = (pageNumber - 1) * pageSize;

  try {
    const courses = await Course.find().skip(skip).limit(parseInt(pageSize));
    const totalCourses = await Course.countDocuments();

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


router.get('/', auth, roles('admin'), async (req, res) => {
  const { pageNumber = 1, pageSize = 10 } = req.query;
  const skip = (pageNumber - 1) * pageSize;

  try {
    const courses = await Course.find().lean().skip(skip).limit(parseInt(pageSize));
    const totalCourses = await Course.countDocuments();

    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.find({ materia_id: course._id }).lean();
        const enrollmentsCount = enrollments.length;
        const studentIds = enrollments.map(enrollment => enrollment.estudiante_id);
        return { ...course, enrollmentsCount, studentIds };
      })
    );

    res.json({ courses: coursesWithEnrollments, totalCourses });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
module.exports = router;