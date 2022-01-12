const { StatusCodes } = require("http-status-codes");
const path = require('path');
const fs = require("fs");

const ROOT = path.dirname(require.main.filename) + '/public/';

const mimeTypes = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    jpg: 'image/jpeg',
};

const sendStaticResource = (req, res) => {
    let filePath = path.resolve(ROOT + req.endpoint);

    if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile())
        filePath = path.resolve(ROOT + 'index.html');

    const fileExt = path.extname(filePath).slice(1);
    const mime = mimeTypes[fileExt];

    res.writeHead(StatusCodes.OK, {'Content-Type': mime});
    fs.createReadStream(filePath).pipe(res);
}

module.exports = {
    sendStaticResource,
}
