const mongoose = require('../db/mongodb');

const UserSchema = new mongoose.Schema({
  account: String,
  password: String,
})


const User = mongoose.model('User', UserSchema)

module.exports = { User }
