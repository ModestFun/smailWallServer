const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();

const options = {
    key: fs.readFileSync(path.resolve('./cert/modestfun.top.key')),
    cert: fs.readFileSync(path.resolve('./cert/modestfun.top_bundle.pem'))
}

const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

httpServer.listen(80, () => {
    console.log('HTTP running 80');
})

httpsServer.listen(443, () => {
    console.log('HTTPS running 443')
})

app.get('/', (req, res) => {

    res.send('NB');
})