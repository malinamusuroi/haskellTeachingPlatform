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

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.post('/compile', function (req, res) {
    const haskellCode = req.body;
    const fileContent = "main = do print (" + haskellCode.val + ")";
    var response;
    fs.writeFile("../../haskellFile.hs", fileContent, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
    exec('cd ../../ && ghc haskellFile.hs', function (error, stdout, stderr) {
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
        if (error !== null) {
            response = error.toString();
            res.json({ body: response });
            return;
        }
        console.log("The file was compiled!");
        exec('cd ../../ && ./haskellFile', function (error, stdout, stderr) {
            console.log('stdout: ', stdout);
            console.log('stderr: ', stderr);
            if (error !== null) {
                console.log('exec error: ', error);
            }
            response = stdout;
            res.json({ body: response });
        });
    });
});
