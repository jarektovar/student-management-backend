const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  hash_usuario: { type: String, required: true, unique: true },
  hash_password: { type: String, required: true }
});

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
