const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authSchema = new mongoose.Schema({
  hash_usuario: { type: String, required: true, unique: true },
  hash_password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'student'] },
  estudiante_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }
});

authSchema.pre('save', async function(next) {
  if (this.isModified('hash_password') || this.isNew) {
    this.hash_password = await bcrypt.hash(this.hash_password, 10);
  }
  next();
});

authSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, role: this.role, estudiante_id: this.estudiante_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('Generated JWT:', token);
  return token;
};


const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
