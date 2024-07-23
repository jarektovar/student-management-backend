const express = require('express');
const multer = require('multer');
const router = express.Router();
const Student = require('../models/student');

// Configuración de multer para subir archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 } 
});

// Obtener estudiantes con paginación y filtros
router.get('/', async (req, res) => {
  const page = parseInt(req.query.pageNumber) || 1;
  const limit = parseInt(req.query.pageSize) || 10;
  const searchQuery = req.query.searchQuery || '';
  const sortOption = req.query.sortOption || '';

  try {
    const query = {
      $or: [
        { nombre_name: { $regex: searchQuery, $options: 'i' } },
        { apellido: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    console.log('Query:', query); 
    console.log('Sort Option:', sortOption); 

    const aggregationPipeline = [
      { $match: query },
      { $sort: sortOption ? { [sortOption]: 1 } : {} },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $project: { photo_estudiante: 0 } }
    ];

    const students = await Student.aggregate(aggregationPipeline).allowDiskUse(true);
    const totalStudents = await Student.countDocuments(query);

    console.log('Students:', students); 

    res.json({
      students,
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Error fetching students' });
  }
});

// Obtener la foto de un estudiante por ID
router.get('/:id/photo', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('photo_estudiante');
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student photo:', error);
    res.status(500).send(error.message);
  }
});

// Obtener un estudiante por ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).send(error.message);
  }
});

// Actualizar un estudiante por ID
router.put('/:id', upload.single('photo_estudiante'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.photo_estudiante = req.file.buffer.toString('base64');
    }
    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send(error.message);
  }
});

// Crear un nuevo estudiante
router.post('/', upload.single('photo_estudiante'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    const { nombre_name, apellido, numero_documento, programa_id } = req.body;
    const photo_estudiante = req.file ? req.file.buffer.toString('base64') : null;
    const newStudent = new Student({
      nombre_name,
      apellido,
      numero_documento,
      programa_id,
      photo_estudiante
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: 'Error registering student' });
  }
});

// Eliminar un estudiante por ID
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
