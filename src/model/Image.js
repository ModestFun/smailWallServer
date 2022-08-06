const mongoose = require('../db/mongodb');

const ImageSchema = new mongoose.Schema({
  state: String,
  path: String
})


const Image = mongoose.model('Image', ImageSchema)

module.exports = { Image }
