var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require("./config").config();

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true, parameterLimit: 50000 }));


console.log(config);


var server = app.listen(config.SERVER_PORT,  function () {
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
        token: config.DKGCLIENT_AUTH_TOKEN
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

app.get(config.SERVER_PREFIX_PATH + '/node/info', async (req, res) => {
    logRequest('GET /node/info');
    const result = await DkgClient.node.info();
    logResponse(result);
    res.send(result);
});

app.post(config.SERVER_PREFIX_PATH + '/asset/create', async function (req, res) {
    logRequest('POST /asset/create', req);
    console.time("DkgClient.asset.create");
    const result = await DkgClient.asset.create(req.body, publishOptions);
    console.timeEnd("DkgClient.asset.create");
    logResponse(result);
    res.send(result);
});

app.post(config.SERVER_PREFIX_PATH + '/asset/read', async (req, res) => {
    logRequest('POST /asset/read', req);
    const result = await DkgClient.asset.get(req.body.UAL);
    logResponse(result);
    res.send(result);
}); 

app.post(config.SERVER_PREFIX_PATH + '/graph/query', async (req, res) => {
    logRequest('POST /graph/query', req);
    const result = await dkgGraphQuery(req.body.query,req.body.form);
    logResponse(result);
    res.send(result);
});

app.get(config.SERVER_PREFIX_PATH + '/graph/query/organization/monitor/measurement', async (req, res) => {
    logRequest('POST /graph/query/', req);
    const query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                    PREFIX recheck_green_box: <https://ontochain.recheck.io/schema/recheck-green-box/> \
                    PREFIX recheck_green_box_data: <https://ontochain.recheck.io/> \
                    SELECT ?organization ?monitorDevice ?timeFrom ?timeTo ?metric ?value ?unit \
                    WHERE { \
                        ?organization       rdf:type        recheck_green_box:RecheckOrganization. \
                        ?organization       recheck_green_box:hasMonitor            ?monitor. \
                        ?monitor            recheck_green_box:hasMonitorDevice      ?monitorDevice. \
                        ?monitorDevice      recheck_green_box:makesMeasurement      ?measurement. \
                        ?measurement        recheck_green_box:hasParameters         ?parameters. \
                        ?parameters         recheck_green_box:hasDateTimeInterval   ?dateTimeInterval. \
                        ?dateTimeInterval   recheck_green_box:timeFrom              ?timeFrom; \
                                            recheck_green_box:timeTo                ?timeTo. \
                        ?measurement        recheck_green_box:hasMeasurementValue   ?hasValue. \
                        ?hasValue           recheck_green_box:metric                ?metric; \
                                            recheck_green_box:value                 ?value; \
                                            recheck_green_box:unit                  ?unit. \
                        FILTER (?timeFrom > ${timefrom}) . \
                        FILTER (?organization = <https://ontochain.recheck.io/${organization}>)  . \
                    }"
                    .replace("${timefrom}", req.query.timeFrom)
                    .replace("${organization}", req.query.organization);
    const result = await dkgGraphQuery(query,"SELECT");
    logResponse(result);
    res.send(result);
});


async function dkgGraphQuery(query, form) {
    const result = await DkgClient.graph.query(query,form);
    /*
        instead of returning : 
        {
            "status": "COMPLETED",
            "data": [
                {
                    "organization": "https://ontochain.recheck.io/Recheck",
                    "monitorDevice": "https://ontochain.recheck.io/867648045407705",
                    "timeFrom": 1685547699000,
                    "timeTo": 1685547699000,
                    "metric": "\"CO2\"",
                    "value": "\"767.0\"",
                    "unit": "\"PPM\""
                }, ...
        }
        replace double quotes "unit": "\"PPM\""  >> "unit": "PPM"
    */
    for (d in result.data) {
        for (key in result.data[d]) {            
            if (result.data[d].hasOwnProperty(key)) {
                if (typeof result.data[d][key] === 'string' || result.data[d][key] instanceof String) {
                    result.data[d][key] = result.data[d][key].replace(/['"]+/g, '');
                }               
            }
         }
    }
    return result;
}

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