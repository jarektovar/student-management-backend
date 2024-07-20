const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Auth = require('../models/auth');

router.post('/login', async (req, res) => {
  const { hash_usuario, hash_password } = req.body;

  try {
    console.log(`Attempting login for user: ${hash_usuario}`);
    const user = await Auth.findOne({ hash_usuario });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const isMatch = await bcrypt.compare(hash_password, user.hash_password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const token = user.generateAuthToken();
    console.log('Login successful, token generated');
    res.json({ token });
  } catch (error) {
    console.log('Error during login:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
