const express = require('express');
const router = express.Router();
const multer = require('multer');
const Student = require('../models/student');

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  }
});
const upload = multer({ storage: storage });

// Obtener todos los estudiantes con paginación y ordenamiento
router.get('/', async (req, res) => {
  const { pageSize = 10, pageNumber = 1, sortBy = 'fecha_creacion', sortDirection = 'desc' } = req.query;
  const sortOptions = { [sortBy]: sortDirection.toLowerCase() === 'asc' ? 1 : -1 };
  const skip = (pageNumber - 1) * pageSize;

  try {
    const students = await Student.find().sort(sortOptions).skip(skip).limit(parseInt(pageSize));
    const totalStudents = await Student.countDocuments();
    res.json({ students, totalStudents });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Crear un nuevo estudiante
router.post('/', upload.single('photo_estudiante'), async (req, res) => {
  const { nombre_name, apellido, numero_documento, programa_id } = req.body;
  const photo_estudiante = req.file ? req.file.path : null;

  try {
    const newStudent = new Student({ nombre_name, apellido, numero_documento, programa_id, photo_estudiante });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
