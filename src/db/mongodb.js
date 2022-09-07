const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL)
// mongoose.connect("mongodb://127.0.0.1:27017/")
mongoose.Promise = global.Promise;

module.exports = mongoose

