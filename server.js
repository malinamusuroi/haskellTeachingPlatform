/* eslint-disable no-console */
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const path = require('path');
const open = require('open');

const port = 3000;
const app = express();
const { exec } = require('child_process');
const fs = require('fs');
const config = require('./webpack.config.js');

const compiler = webpack(config);

app.use(express.json());

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

app.listen(port, (error) => {
  if (error) {
    console.log(error);
  } else {
    open(`http://localhost:${port}`);
  }
});

const escapeShell = (cmd) => {
  return cmd.replace(/(["\s'$`\\])/g,'\\$1');
};

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.post('/compile', (req, res) => {
  const haskellCode = req.body;
  let { val: fileContent } = haskellCode;
  const { v: functionCall } = haskellCode;
  fileContent = `${fileContent}\nmain=undefined`;
  let response;
  const fileName = `haskell${makeid(10)}.hs`;
  fs.writeFileSync(`/tmp/${fileName}`, fileContent, (err) => {
    if (err) {
      console.log(err);
    }
    console.log('The file was saved!');
  });
  console.log(escapeShell(functionCall));
  const call = `cd /tmp && echo ${escapeShell(functionCall)} | ghci -ddump-json ${fileName}`;
  exec(call, (error, stdout, stderr) => {
    console.log('stdout: ', stdout);
    console.log('stderr: ', stderr);
    if (stderr !== '') {
      console.log('stderr: ', stderr);
      res.json({
        body: stderr,
        isError: true,
        isRuntimeError: stderr.indexOf('Exception: ') !== -1,
      });
      console.log('exec error: ', error);
      return;
    }
    console.log("responseeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", response, stdout);
    response = stdout.substring(stdout.indexOf('*Main') + 1);
    res.json({
      code: functionCall,
      body: response,
      isError: false,
    });

    fs.unlink(`/tmp/${fileName}`, (err) => {
      if (err) console.error(err);
    });
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});
