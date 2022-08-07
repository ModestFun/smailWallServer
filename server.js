const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')
const path = require('path');
const fs = require('fs');
const { Image } = require('./src/model/Image');
const { User } = require('./src/model/User');
const app = express();

const pending = 'pending';
const success = 'success';
const fail = 'fail';

const host = 'http:127.0.0.1:8080/'

app.use(multer({ dest: path.resolve('./public/images') }).any());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(8080, () => console.log('server running at 8080'));

// 上传照片
app.post('/uploadImg', async (req, res) => {
  const newPath = `${req.files[0].path}${Date.now()}.jpg`;
  try {
    await fs.renameSync(req.files[0].path, newPath);
    await Image.create({
      state: pending,
      download: false,
      fileName: newPath.split('/').reverse()[0],
      uploadTime: Date.now()
    });
    res.send({ success: true })
  } catch (err) {
    console.log(err);
    res.send({ success: false })
  }
})

// 获取待审核图片列表
app.get('/getUncheckedImgList', async (req, res) => {
  const { pageNum = 1, pageSize = 10 } = req.query;
  const images = await Image.find({ state: pending }).skip((pageNum - 1) * parseInt(pageSize)).limit(pageSize);
  const imgList = images.map(item => {
    return {
      url: `${host}img/${item.fileName}`,
      id: item._id,
    }
  });
  res.send({ imgList })
})

// 审核一张照片
app.get('/checkImg', async (req, res) => {
  const { id, state } = req.query;
  if (![success, fail].includes(state)) {
    res.send({ success: false, msg: "state illegal" })
    return;
  }
  try {
    await Image.findOneAndUpdate({ _id: id }, {
      $set: { state }
    }, {});
    res.send({ success: true });
  } catch (err) {
    console.log(err);
    res.send({ success: false })
  }

})

// 获取图片列表
app.get('/getImgList', async (req, res) => {
  const { pageNum = 1, pageSize = 10 } = req.query;
  const images = await Image.find().skip((pageNum - 1) * parseInt(pageSize)).limit(pageSize);
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

// 管理员登陆接口
app.post('/login', async (req, res) => {
  const { account, password } = req.body;
  try {
    const user = await User.find({ account });
    console.log(user);
    if (!user.length) {
      return res.send({ success: false, msg: 'account not found!' });
    }
    if (user[0].password === password) {
      return res.send({ success: true });
    } else {
      return res.send({ success: false, msg: 'password error!' });
    }
  } catch (err) {
    console.log(err);
    res.send({ success: false, msg: 'account or password error!' });
  }
})

// 用户列表
app.get('/getUser', async (req, res) => {
  try {
    const userList = await User.find();
    res.send({ success: true, userList });
  } catch (err) {
    console.log(err);
    res.send({ success: false })
  }
})

// 删除用户
app.get('/removeUser', async (req, res) => {
  const { id } = req.query;
  try {
    await User.findByIdAndRemove({ _id: id });
    res.send({ success: true });
  } catch (err) {
    console.log(err);
    res.send({ success: false })
  }
})

// 修改用户密码
app.get('/updateUser', async (req, res) => {
  const { id, newPassword } = req.query;
  try {
    await User.findOneAndUpdate({ _id: id }, {
      $set: { password: newPassword }
    }, {});
    res.send({ success: true });
  } catch (err) {
    console.log(err);
    res.send({ success: false })
  }
})

// 注册账号密码
app.get('/register', async (req, res) => {
  const { account, password } = req.query;
  try {
    await User.create({
      account, password
    });
    res.send({ success: true })
  } catch (err) {
    console.log(err);
    res.send({ success: false })
  }
})

app.get('/hello', async (req, res) => {
  console.log('here');

  const images = await Image.find();
  console.log(images);

  res.send({ hei: 'hello world' });
})
