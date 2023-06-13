var utils = require('../utils/utils');


var logIdIterator = 0;
var startTime;


function logRequest(req, res, next) {
    startTime = process.hrtime();
    var reqBody = "";
    if (!utils.isEmptyObject(req.body)) {
        reqBody = 'Request Body=\n' + JSON.stringify(req.body, null, 2);
    }

    console.log(`id=${++logIdIterator} ${new Date().toISOString()} remote=${req.ip} ${req.method}:${req.originalUrl} \n ${reqBody}`);

    next();
}

function logResponse(req, res, next) {
    var oldWrite = res.write;
    var oldEnd = res.end;
    var chunks = [];

    res.write = function (chunk) {
        chunks.push(Buffer.from(chunk));
        oldWrite.apply(res, arguments);
    };

    res.end = function (chunk) {
        if (chunk) {
            chunks.push(Buffer.from(chunk));
        }
        var body = Buffer.concat(chunks).toString('utf8');
        var resBody = 'Response Body=\n' + body;

        console.log(`id=${logIdIterator} ${new Date().toISOString()} remote=${req.ip} ${req.method}:${req.originalUrl} status=${res.statusCode} duration=${getActualRequestDurationInMilliseconds(startTime)} ms\n ${resBody.substring(0, 777)} \n....`);
        oldEnd.apply(res, arguments);
    };

  next();
}

function getActualRequestDurationInMilliseconds(start) {
    const NS_PER_SEC = 1e9; // convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

module.exports = {
    logRequest,
    logResponse
}