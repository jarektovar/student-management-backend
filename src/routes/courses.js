const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const Student = require('../models/student'); 

router.get('/', auth, roles('admin'), async (req, res) => {
  const { pageNumber = 1, pageSize = 10 } = req.query;
  const skip = (pageNumber - 1) * pageSize;

  try {
    const courses = await Course.find().lean().skip(skip).limit(parseInt(pageSize));
    const totalCourses = await Course.countDocuments();

    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.find({ materia_id: course._id }).lean();

        // Obtener los nombres y apellidos de los estudiantes
        const studentIds = enrollments.map(enrollment => enrollment.estudiante_id);
        const students = await Student.find({ _id: { $in: studentIds } });

        const enrollmentsInfo = enrollments.map(enrollment => {
          const student = students.find(student => student._id.equals(enrollment.estudiante_id));
          return {
            nombre: student ? student.nombre_name : 'Desconocido',
            apellido: student ? student.apellido : 'Desconocido'
          };
        });

        const enrollmentsCount = enrollmentsInfo.length;

        return { ...course, enrollmentsCount, enrollmentsInfo };
      })
    );

    console.log('Courses with enrollments:', coursesWithEnrollments); 
    res.json({ courses: coursesWithEnrollments, totalCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
