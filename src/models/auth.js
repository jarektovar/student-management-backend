const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
