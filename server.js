const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Image } = require('./src/model/Image');
const app = express();

const pending = 'pending';
const success = 'success';
const fail = 'fail';

app.use(multer({ dest: path.resolve('./public/images') }).any());

app.listen(8080, () => console.log('server running at 8080'));

app.post('/uploadImg', async (req, res) => {
  console.log(req.files[0].path);
  const newPath = `${req.files[0].path}${Date.now()}.jpg`;
  console.log(newPath);

  await fs.renameSync(req.files[0].path, newPath);

  const image = await Image.create({
    state: pending,
    path: newPath
  });

  res.send({ success: true })
})

app.get('/hello', async (req, res) => {
  console.log('here');

  const images = await Image.find();
  console.log(images);

  res.send({ hei: 'hello world' });
})
