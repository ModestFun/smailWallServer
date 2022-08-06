const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Image } = require('./src/model/Image');
const app = express();

const pending = 'pending';
const success = 'success';
const fail = 'fail';

const host = 'http:127.0.0.1:8080/'

app.use(multer({ dest: path.resolve('./public/images') }).any());

app.listen(8080, () => console.log('server running at 8080'));

app.post('/uploadImg', async (req, res) => {
  const newPath = `${req.files[0].path}${Date.now()}.jpg`;
  try {
    await fs.renameSync(req.files[0].path, newPath);
    await Image.create({
      state: pending,
      fileName: newPath.split('/').reverse()[0],
      uploadTime: Date.now()
    });
    res.send({ success: true })
  } catch (err) {
    console.log(err);
    res.send({ success: false })
  }
})

// 获取图片列表
app.get('/getImgList', async (req, res) => {
  const { pageNum = 1, pageSize = 10 } = req.query;
  const images = await Image.find().skip((pageNum - 1) * parseInt(pageSize)).limit(pageSize);
  console.log(images);
  const imgList = images.filter(item => item.state === pending).map(item => `${host}img/${item.fileName}`);
  res.send({ imgList })
})

// 预览单张图片
app.get('/img/:fileName', (req, res) => {
  const { fileName } = req.params;
  if (fileName) {
    res.sendFile(path.resolve(`./public/images/${req.params.fileName}`));
  } else {
    res.send('Not Found Image!')
  }
})

app.get('/hello', async (req, res) => {
  console.log('here');

  const images = await Image.find();
  console.log(images);

  res.send({ hei: 'hello world' });
})
