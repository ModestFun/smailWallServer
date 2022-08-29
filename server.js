const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')
const path = require('path');
const jwt = require('jsonwebtoken');
const md5 = require("md5");
const fs = require('fs');
const { Image } = require('./src/model/Image');
const { User } = require('./src/model/User');
const http = require('http');
const https = require('https');
const app = express();

const salt = 'E=j_Z`$*NxgAOla';
const pending = 'pending';
const success = 'success';
const fail = 'fail';


const options = {
  key: fs.readFileSync(path.resolve('./cert/miniapp.wstour.net.key')),
  cert: fs.readFileSync(path.resolve('./cert/miniapp.wstour.net_bundle.pem'))
}

const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

httpServer.listen(80, () => {
  console.log('HTTP running 80');
})

// httpsServer.listen(443, () => {
//   console.log('HTTPS running 443')
// })

httpsServer.listen(8080, () => {
  console.log('HTTPS running 8080')
})

app.get('/', (req, res) => {
  res.send('NB');
})

// app.listen(8080, () => console.log('server running at 8080'));

app.use(multer({ dest: path.resolve('./public/images') }).any());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
      url: `/img/${item.fileName}`,
      id: item._id,
    }
  });
  res.send({ imgList })
})

// 获取待下载图片列表
app.post('/getUnDownloadImgList', async (req, res) => {
  const { token } = req.body;
  if (checkAuth(token)) {
    const images = await Image.find({ download: false, state: success });
    const imgList = images.map(item => {
      return {
        id: item.id
      }
    });
    res.send({ success: true, imgList })
    return;
  }
  res.send({ success: false, msg: 'token invalid' })
})

// 下载一张图片
app.get('/downloadImg/:id', async (req, res) => {
  const { id } = req.params;
  if (id) {
    const img = await Image.findById({ _id: id });
    const file = path.resolve(`./public/images/${img.fileName}`);
    await Image.findByIdAndUpdate({ _id: id }, {
      $set: { download: true }
    }, {});
    res.download(file);
  } else {
    res.send('Not Found Image!')
  }
})

// 审批一张照片
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
  const imgList = images.filter(item => item.state === pending).map(item => `/img/${item.fileName}`);
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

// 鉴权方法
async function checkAuth (token) {
  try {
    const { key } = await jwt.verify(token, salt);
    const authKey = md5(new Date().getHours());
    return key === authKey;
  } catch (err) {
    return false
  }
}

// 审核未通过的照片，在30天后自动删除
const checkImgTimeOut = () => {
  setInterval(async () => {
    const list = await Image.find({ state: fail, uploadTime: { $lt: Date.now() } });
    if (list.length) {
      list.forEach((item) => {
        fs.rmSync(path.resolve(`./public/images/${item.fileName}`));
      });
      Image.deleteMany({ state: fail, uploadTime: { $lt: Date.now() } }).then((res) => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      })
    } else {
      console.log('今天暂无要删除的照片');
    }
  }, 3600000 * 24);
}

checkImgTimeOut();

// 初始化第一批账号密码
const initFirstAdmin = async () => {
  const userList = await User.find();
  const txt = fs.readFileSync('./state.txt', 'utf-8');
  try {
    if (userList.length === 0 && txt.trim() === 'false') {
      await User.create({
        account: 'admin', password: '123456'
      });
      await fs.writeFileSync('./state.txt', 'true');
      console.log('账号初始化成功');
    }
  } catch (err) {
    console.log(err);
    console.log('初始化账号失败');
  }
}

initFirstAdmin();
