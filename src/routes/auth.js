const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth');

// Endpoint de login
router.post('/login', async (req, res) => {
  const { hash_usuario, hash_password } = req.body;

  try {
    const user = await Auth.findOne({ hash_usuario });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const isMatch = await bcrypt.compare(hash_password, user.hash_password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const token = user.generateAuthToken();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
