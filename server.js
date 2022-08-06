const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(multer({ dest: path.resolve('./public/images') }).any());

app.listen(8080, () => console.log('server running at 8080'));

app.post('/uploadImg', (req, res) => {
  console.log(req.body);
  console.log(req.files);
  console.log(req.files[0]);
  console.log(req.files[0].path);
})

app.get('/hello', (req, res) => {
  console.log('here');
  res.send({ hei: 'hello world' });
})
