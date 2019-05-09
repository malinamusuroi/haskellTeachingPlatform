const express = require('express')
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const path = require('path')
const open = require('open')
const port = 3000;
const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);
const exec = require('child_process').exec;
const fs = require('fs');

app.use(express.json());

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
}));

app.listen(port, function (error) {
    if (error) {
        console.log(error);
    } else {
        open(`http://localhost:${port}`)
    }
});

app.post('/compile', function (req, res) {
    const haskellCode = req.body;
    var fileContent = haskellCode.val
    const functionCall = haskellCode.v
    fileContent = fileContent + '\n' + 'main=undefined'
    var response;
    fs.writeFile("../../haskellFile.hs", fileContent, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
    const call  = 'cd ../../ && echo ' + functionCall + '| ghci -ddump-json haskellFile.hs'
    exec(call, function (error, stdout, stderr) {
       console.log('stdout: ', stdout);
       console.log('stderr: ', stderr);
       if (stderr !== "") {
          console.log('stderr: ', stderr);
          res.json({ body: stderr });
          console.log('exec error: ', error);
          return;
       }
       response = stdout.substring(stdout.indexOf("*Main") + 1);
       res.json({ body: response });
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, './public/index.html'));
});
