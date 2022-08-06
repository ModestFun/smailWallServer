const mongoose = require('../db/mongodb');

const ImageSchema = new mongoose.Schema({
  fileName: String,
  uploadTime: String,
  download: Boolean,
  state: String,
})


const Image = mongoose.model('Image', ImageSchema)

module.exports = { Image }
