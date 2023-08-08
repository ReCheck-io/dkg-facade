var express = require('express');
var json2csv = require('json2csv');

var dkgService = require('../services/dkgService');
var utils = require('../utils/utils');
var download = require('../utils/download');

const router = express.Router();

let lockRead = false;

let lockWrite = false;

router.get('/node/info', async (req, res, next) => {
    if(lockRead) {
        res.send("Request can not be executed now until previous is completed");
        return;
    }
    lockRead = true;
    try {
        const result = await dkgService.nodeInfo();
        res.send(result);
    } catch(error) {
        next(error);
    }
    lockRead = false;
});

router.get('/increaseAllowance', async (req, res, next) => {
    if(lockWrite) {
        res.send("Request can not be executed now until previous is completed");
        return;
    }
    lockWrite = true;
    try {
        const result = await dkgService.increaseAllowance();
        res.send(result);
    } catch(error) {
        next(error);
    }
    lockWrite = false;
});

router.post('/asset/create', async function (req, res, next) {
    if(lockWrite) {
        res.send("Request can not be executed now until previous is completed");
        return;
    }
    lockWrite = true;
    try {
        const result = await dkgService.create(req.body);
        res.send(result);
    } catch(error) {
        next(error);
    }
    lockWrite = false;
});

router.post('/asset/read', async (req, res, next) => {
    if(lockRead) {
        res.send("Request can not be executed now until previous is completed");
        return;
    }
    lockRead = true;
    try {
        const result = await dkgService.readUAL(req.body.UAL);
        res.send(result);
    } catch (error) {
        next(error);
    }
    lockRead = false;
});

router.post('/graph/query', async (req, res, next) => {
    if(lockRead) {
        res.send("Request can not be executed now until previous is completed");
        return;
    }
    lockRead = true;
    try {
        const result = await dkgService.query(req.body.query,req.body.form);
        res.send(result);
    } catch (error) {
        next(error);
    }
    lockRead = false;
});

router.get('/graph/query/organization/measurement', async (req, res, next) => {
    if(lockRead) {
        res.send("Request can not be executed now until previous is completed");
        return;
    }
    lockRead = true;
    try {
        if (utils.isBlank(req.query.timeFrom)) {
            throw new Error('timeFrom is blank');
        }
        if (utils.isBlank(req.query.organization)) {
            throw new Error('organization is blank');
        }

        var query;
        if (!utils.isBlank(req.query.timeTo)) {
            if (!utils.isBlank(req.query.deviceId)) {
                query = dkgService.queryByOrganizationAndGroupIdAndTimeFromAndTimeTo
                    .replace("${timeFrom}", req.query.timeFrom)
                    .replace("${timeTo}", req.query.timeTo)
                    .replace("${monitorDevice}", req.query.deviceId)
                    .replace("${organization}", req.query.organization);
            } else {
                query = dkgService.queryByOrganizationAndTimeFromAndTimeTo
                    .replace("${timeFrom}", req.query.timeFrom)
                    .replace("${timeTo}", req.query.timeTo)
                    .replace("${organization}", req.query.organization);
            }            
        } else {
            query = dkgService.queryByOrganizationAndTimeFrom
                    .replace("${timeFrom}", req.query.timeFrom)
                    .replace("${organization}", req.query.organization);
        }
        
        const queryResult = await dkgService.query(query,"SELECT");

        if (req.query.transformForJasperStudio === "true"){
            dkgService.transformForJasperStudio(queryResult);
        }

        if(req.query.downloadAs === "json") {            
            download.downloadAsFile(res, JSON.stringify(queryResult.data, null, 2), "organizationMeasurements.json");
        }
        else if(req.query.downloadAs === "csv") {            
            const parser = new json2csv.Parser({});
            const queryResultAsFile = parser.parse(queryResult.data);
            download.downloadAsFile(res, queryResultAsFile, "organizationMeasurements.csv");
        }
        else {
            res.send(queryResult);
        }        
    } catch (error) {
        next(error);
    }
    lockRead = false;
});


module.exports = {
    router
}