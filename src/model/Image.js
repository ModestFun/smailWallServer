const mongoose = require('../db/mongodb');

const ImageSchema = new mongoose.Schema({
  state: String,
  fileName: String,
  uploadTime: String,
})


const Image = mongoose.model('Image', ImageSchema)

module.exports = { Image }
