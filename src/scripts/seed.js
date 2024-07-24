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

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('Connected to MongoDB');

    // Limpiar datos anteriores
    await Promise.all([
      Student.deleteMany({}),
      Subject.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Faculty.deleteMany({}),
      Program.deleteMany({}),
      Auth.deleteMany({})
    ]);
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
      { nombre_asignatura: 'Cátedra Universidad y Entorno' },
      { nombre_asignatura: 'Matemáticas Discretas' },
      { nombre_asignatura: 'Estructuras de Datos' },
      { nombre_asignatura: 'Bases de Datos' },
      { nombre_asignatura: 'Redes de Computadoras' }
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

    const specificStudentsData = [
      { nombre_name: 'Santiago', apellido: 'Andrade Mesa', numero_documento: '1192763972' },
      { nombre_name: 'Yesika Andrea', apellido: 'Rojas', numero_documento: '1002461807' },
      { nombre_name: 'Andrés Santiago', apellido: 'Salamanca Naranjo', numero_documento: '1007751303' },
      { nombre_name: 'José Daniel', apellido: 'Rivas', numero_documento: '1192716867' },
      { nombre_name: 'Carlos David', apellido: 'Quintero Florez', numero_documento: '1057606256' },
      { nombre_name: 'Jarek', apellido: 'Tovar Martinez', numero_documento: '1099207727' },
      { nombre_name: 'Juan Sebastian', apellido: 'Montañez Chaparro', numero_documento: '1002550453' },
      { nombre_name: 'Sergio Felipe', apellido: 'Santos Hernandez', numero_documento: '1002461971' }
    ];

    const generatedDocuments = new Set(specificStudentsData.map(student => student.numero_documento));
    
    const specificStudents = specificStudentsData.map(student => ({
      nombre_name: student.nombre_name,
      apellido: student.apellido,
      numero_documento: student.numero_documento,
      programa_id: insertedPrograms[0]._id,
      photo_estudiante: '' // Sin foto para los estudiantes específicos
    }));

    const randomStudents = Array.from({ length: 20000 }, (_, index) => {
      let numero_documento;
      do {
        numero_documento = faker.number.int({ min: 1000000000, max: 9999999999 }).toString();
      } while (generatedDocuments.has(numero_documento));
      generatedDocuments.add(numero_documento);

      return {
        nombre_name: faker.person.firstName(),
        apellido: faker.person.lastName(),
        numero_documento,
        programa_id: insertedPrograms[0]._id,
        photo_estudiante: '' // Sin foto para los estudiantes aleatorios
      };
    });

    const students = specificStudents.concat(randomStudents);

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

    console.log('Creating users...');
    const users = [
      { hash_usuario: 'admin', hash_password: await bcrypt.hash('admin', 10), role: 'admin' },
      { hash_usuario: '1192763972', hash_password: await bcrypt.hash('password', 10), role: 'student', estudiante_id: insertedStudents[0]._id }
    ];

    const additionalStudents = await Promise.all(insertedStudents.slice(1, 1000).map(async (student) => ({
      hash_usuario: `${student.numero_documento}`,
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
    mongoose.connection.close();
  });
