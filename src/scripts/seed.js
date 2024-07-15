const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

dotenv.config();

const Student = require('../models/student');
const Subject = require('../models/subject');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const Faculty = require('../models/faculty');
const Program = require('../models/program');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Limpiar datos anteriores
    await Student.deleteMany({});
    await Subject.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Faculty.deleteMany({});
    await Program.deleteMany({});
    console.log('Previous data cleared');

    // Datos de ejemplo
    const faculties = [
      { nombre_facultad: 'Facultad de Ingeniería' },
      { nombre_facultad: 'Facultad de Ciencias' }
    ];
    const insertedFaculties = await Faculty.insertMany(faculties);
    console.log('Faculties inserted');

    const programs = [
      { nombre_programa: 'Ingeniería de Sistemas y Computación', facultad_id: insertedFaculties[0]._id },
      { nombre_programa: 'Matemáticas', facultad_id: insertedFaculties[1]._id }
    ];
    const insertedPrograms = await Program.insertMany(programs);
    console.log('Programs inserted');

    const subjects = [
      { nombre_asignatura: 'Cátedra Universidad y Entorno', programa_id: insertedPrograms[0]._id },
      { nombre_asignatura: 'Matemáticas Discretas', programa_id: insertedPrograms[0]._id },
      { nombre_asignatura: 'Estructuras de Datos', programa_id: insertedPrograms[0]._id },
      { nombre_asignatura: 'Bases de Datos', programa_id: insertedPrograms[0]._id },
      { nombre_asignatura: 'Redes de Computadoras', programa_id: insertedPrograms[0]._id }
    ];
    const insertedSubjects = await Subject.insertMany(subjects);
    console.log('Subjects inserted');

    const generatedDocuments = new Set();
    const students = Array.from({ length: 20000 }, () => {
      let numero_documento;
      do {
        numero_documento = faker.number.int({ min: 1000000000, max: 9999999999 }).toString();
      } while (generatedDocuments.has(numero_documento));
      generatedDocuments.add(numero_documento);

      return {
        nombre_name: faker.person.firstName(),
        apellido: faker.person.lastName(),
        numero_documento,
        programa_id: insertedPrograms[0]._id
      };
    });

    const photoDirectory = path.join(__dirname, 'photos');
    if (!fs.existsSync(photoDirectory)) {
      fs.mkdirSync(photoDirectory);
    }
    const studentPhotos = fs.readdirSync(photoDirectory).slice(0, 1000);
    studentPhotos.forEach((photo, index) => {
      if (students[index]) {
        students[index].photo_estudiante = path.join('photos', photo);
      }
    });

    console.log('Inserting students...');
    const insertedStudents = await Student.insertMany(students);
    console.log('Students inserted');

    console.log('Creating courses...');
    const courses = [];
    for (const subject of insertedSubjects) {
      for (let i = 1; i <= 3; i++) {
        courses.push({
          asignatura_id: subject._id,
          cupos_materia: 20,
          nombre: `${subject.nombre_asignatura} Grupo ${i}`
        });
      }
    }
    const insertedCourses = await Course.insertMany(courses);
    console.log('Courses created');

    console.log('Creating enrollments...');
    const enrollments = [];

    for (const course of insertedCourses) {
      while (course.cupos_materia > 0) {
        const randomStudent = insertedStudents[Math.floor(Math.random() * insertedStudents.length)];

        const alreadyEnrolled = enrollments.some(enrollment =>
          enrollment.estudiante_id.equals(randomStudent._id) &&
          enrollment.materia_id.equals(course.asignatura_id)
        );

        if (!alreadyEnrolled) {
          enrollments.push({
            materia_id: course._id,
            estudiante_id: randomStudent._id
          });
          course.cupos_materia--; // Reducir el número de cupos
        }
      }
    }

    await Enrollment.insertMany(enrollments);
    console.log('Enrollments created');

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
  });
