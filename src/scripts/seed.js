const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

dotenv.config();

const Student = require('../models/student');
const Auth = require('../models/auth');
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
    await Auth.deleteMany({});
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

    const photoDirectory = path.join(__dirname, '../routes/photos');
    let photoFiles = [];
    if (fs.existsSync(photoDirectory)) {
      photoFiles = fs.readdirSync(photoDirectory).slice(0, 1000);
    } else {
      console.log(`Directory ${photoDirectory} does not exist. No photos will be added.`);
    }

    const generatedDocuments = new Set();
    const students = Array.from({ length: 20000 }, (_, index) => {
      let numero_documento;
      do {
        numero_documento = faker.number.int({ min: 1000000000, max: 9999999999 }).toString();
      } while (generatedDocuments.has(numero_documento));
      generatedDocuments.add(numero_documento);

      let photoBase64 = '';
      if (index < photoFiles.length) {
        const photoPath = path.join(photoDirectory, photoFiles[index]);
        photoBase64 = fs.readFileSync(photoPath, { encoding: 'base64' });
      }

      return {
        nombre_name: faker.person.firstName(),
        apellido: faker.person.lastName(),
        numero_documento,
        programa_id: insertedPrograms[0]._id,
        photo_estudiante: photoBase64
      };
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
          course.cupos_materia--;
        }
      }
    }

    await Enrollment.insertMany(enrollments);
    console.log('Enrollments created');

    // Crear usuarios con credenciales de administrador y estudiante
    console.log('Creating users...');
    const users = [
      { hash_usuario: 'admin', hash_password: await bcrypt.hash('admin', 10), role: 'admin' },
      { hash_usuario: 'student1', hash_password: await bcrypt.hash('student1', 10), role: 'student', estudiante_id: insertedStudents[0]._id }
    ];

    const additionalStudents = await Promise.all(insertedStudents.slice(1, 1000).map(async (student) => ({
      hash_usuario: `student${student._id}`,
      hash_password: await bcrypt.hash('password', 10),
      role: 'student',
      estudiante_id: student._id
    })));

    await Auth.insertMany([...users, ...additionalStudents]);
    console.log('Users created');

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
  });
