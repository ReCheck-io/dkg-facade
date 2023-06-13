function errorHandlerFunction(error, req, res, next) {
    console.error(error.stack);
    res.status(500).send({
        statusCode: 500,
        message: error.message
    });
}

module.exports = {
    errorHandlerFunction
}