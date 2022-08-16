const mongoose = require('mongoose');
let mongoUrl = 'mongodb://127.0.0.1:27017/ExpressApi';

// 获取环境变量中的host
process.argv.forEach((val) => {
  if (val.indexOf('MONGO_URL=') !== -1) {
    const url = val.split('MONGO_URL=').reverse()[0];

    if (url && url.length > 0) {
      mongoUrl = url;
    }
  }
})

mongoose.connect(mongoUrl)
mongoose.Promise = global.Promise;

module.exports = mongoose

