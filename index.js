var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require("./config").config();

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true, parameterLimit: 50000 }));


console.log(config);


var server = app.listen(config.server_port,  function () {
  console.log("DKGFacade is listening");
});


const DKG = require('dkg.js');

const blockchainOptions = {
    name: 'otp::testnet',
    publicKey: config.PUBLIC_KEY,
    privateKey: config.PRIVATE_KEY,
}

const DkgClient = new DKG({
    endpoint: config.OT_NODE_HOSTNAME,
    port: config.OT_NODE_PORT,
    
    blockchain: blockchainOptions,
    
    auth: {
        token: config.dkgClient_auth_token
    },

    maxNumberOfRetries: 30,
    frequency: 2    
});

const publishOptions = {
    epochsNum: 50000, 
    maxNumberOfRetries: 30,
    frequency: 1,
    blockchain: blockchainOptions
};

app.get(config.server_prefix_path + '/node/info', async (req, res) => {
    logRequest('GET /node/info');
    const result = await DkgClient.node.info();
    logResponse(result);
    res.send(result);
});

app.post(config.server_prefix_path + '/asset/create', async function (req, res) {
    logRequest('POST /asset/create', req);
    console.time("DkgClient.asset.create");
    const result = await DkgClient.asset.create(req.body, publishOptions);
    console.timeEnd("DkgClient.asset.create");
    logResponse(result);
    res.send(result);
});

app.post(config.server_prefix_path + '/asset/read', async (req, res) => {
    logRequest('POST /asset/read', req);
    const result = await DkgClient.asset.get(req.body.UAL);
    logResponse(result);
    res.send(result);
}); 

app.post(config.server_prefix_path + '/graph/query', async (req, res) => {
    logRequest('POST /graph/query', req);
    const result = await DkgClient.graph.query(req.body.query,req.body.form);
    for (d in result.data) {
        for (key in result.data[d]) {            
            if (result.data[d].hasOwnProperty(key)) {
                if (typeof result.data[d][key] === 'string' || result.data[d][key] instanceof String) {
                    result.data[d][key] = result.data[d][key].replace(/['"]+/g, '');
                }               
            }
         }
    }
    logResponse(result);
    res.send(result);
});

function logRequest(reqInfo, req) {
    var json;
    if(req) {
        json = req.body;
    } else {
        json = "";
    }

    console.log(new Date().toUTCString() + ' ' + reqInfo + ' :\n\tRequest Body:\n' + JSON.stringify(json, null, 2));
}

function logResponse(result) {
    console.log(new Date().toUTCString() + '\tResponse Body : \n' + JSON.stringify(result, null, 2));

}