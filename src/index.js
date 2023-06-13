var express = require('express');
var bodyParser = require('body-parser');
const cors = require("cors");

var logger = require("./middlewares/logger");
var errorHandler = require("./middlewares/errorHandler");
var dkgRoute = require("./routes/dkgRoute");
var config = require("./config");

console.log(config);

var app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true, parameterLimit: 50000 }));
app.use(cors({origin: "*"}));
  
app.use(logger.logRequest);
app.use(logger.logResponse);

app.use(config.SERVER_PREFIX_PATH, dkgRoute.router);

app.use(errorHandler.errorHandlerFunction);

app.listen(config.SERVER_PORT,  function () {
  console.log("DKGFacade is listening");
});