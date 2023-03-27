var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require("./config").config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

console.log(config);


var server = app.listen(config.server_port,  "localhost", function () {
  console.log("DKGFacade listening at http://localhost:%s", server.address().port)
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
    epochsNum: 2,
    maxNumberOfRetries: 30,
    frequency: 1,
    blockchain: blockchainOptions
};

app.get('/node/info', async (req, res) => {
    console.log('send request node.info');
    const nodeInfo = await DkgClient.node.info();
    console.log(nodeInfo);
    res.send(nodeInfo);
}); 


app.post('/asset/create', async function (req, res) {
    var assetData  = req.body;
    console.log('send request asset.create with \n' + assetData);
    const result = await DkgClient.asset.create(assetData, publishOptions);
    console.log(result);
    res.send(result);
});

app.post('/asset/read', async (req, res) => {
    console.log('send request assset.get with \n' + req.body.UAL);
    const result = await DkgClient.asset.get(req.body.UAL);
    console.log(result);
    res.send(result);
}); 

app.post('/graph/query', async (req, res) => {
    console.log('send request graph.query with \n' + req.body.form + "\n" + req.body.query);
    const result = await DkgClient.graph.query(req.body.query,req.body.form);
    console.log(result);
    res.send(result);
});