const mongoose = require('../db/mongodb');

const AdminPhoneSchema = new mongoose.Schema({
  phone: String,
})


const AdminPhone = mongoose.model('AdminPhone', AdminPhoneSchema)

module.exports = { AdminPhone }
