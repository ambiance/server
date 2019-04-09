const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'business',
    },
  ],
  feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: 'feedback' }],
});

schema.pre('save', async function() {
  // check if the password has been updated
  if (this.isModified('password')) {
    // hash it
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(this.password, salt);
    // set user's password to the hash
    this.password = hash;
  }
  // pass it along
});

const User = mongoose.model('user', schema, 'users');

module.exports = User;
