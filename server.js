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

app.post('/compile', (req, res) => {
  const haskellCode = req.body;
  let { val: fileContent } = haskellCode;
  const { v: functionCall } = haskellCode;
  fileContent = `${fileContent}\nmain=undefined`;
  let response;
  fs.writeFileSync('/tmp/haskellFile.hs', fileContent, (err) => {
    if (err) {
      console.log(err);
    }
    console.log('The file was saved!');
  });
  console.log(escapeShell(functionCall));
  const call = `cd /tmp && echo ${escapeShell(functionCall)} | ghci -ddump-json haskellFile.hs`;
  exec(call, (error, stdout, stderr) => {
    console.log('stdout: ', stdout);
    console.log('stderr: ', stderr);
    if (stderr !== '') {
      console.log('stderr: ', stderr);
      res.json({ body: stderr, isError: true });
      console.log('exec error: ', error);
      return;
    }
    response = stdout.substring(stdout.indexOf('*Main') + 1);
    res.json({ code: functionCall, body: response, isError: false });
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});
