var config = require("../config");

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


const queryBase = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                    PREFIX recheck_green_box: <https://ontochain.recheck.io/schema/recheck-green-box/> \
                    PREFIX recheck_green_box_data: <https://ontochain.recheck.io/> \
                    SELECT DISTINCT ?organization ?monitorDevice ?timeFrom ?timeTo ?metric ?value ?unit \
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
                        ${FILTERS} \
                    }";

                    

const queryByOrganizationAndTimeFrom = queryBase.replace("${FILTERS}", 
                        "FILTER (?timeFrom > ${timeFrom}) . \
                        FILTER (?organization = <https://ontochain.recheck.io/${organization}>)  .");

const queryByOrganizationAndTimeFromAndTimeTo = queryBase.replace("${FILTERS}", 
                                                            "FILTER (?timeFrom > ${timeFrom}) . \
                                                            FILTER (?timeTo < ${timeTo}) . \
                                                            FILTER (?organization = <https://ontochain.recheck.io/${organization}>)  .");

const queryByOrganizationAndGroupIdAndTimeFromAndTimeTo = queryBase.replace("${FILTERS}", 
                                                        "FILTER (?timeFrom > ${timeFrom}) . \
                                                        FILTER (?timeTo < ${timeTo}) . \
                                                        FILTER (?monitorDevice = <https://ontochain.recheck.io/${monitorDevice}>) . \
                                                        FILTER (?organization = <https://ontochain.recheck.io/${organization}>)  .");                    

async function nodeInfo() {
    return await DkgClient.node.info();
}

async function create(content) {
    return await DkgClient.asset.create(content, publishOptions);
}

async function readUAL(ual) {
    return await DkgClient.asset.get(ual);
}

async function query(query, form) {
    const result = await DkgClient.graph.query(query,form);
    /*
        instead of returning :
        {
            "data": [
                {
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

function transformForJasperStudio(queryResult) {
    for (d in queryResult.data) {
        queryResult.data[d].monitorDevice = queryResult.data[d].monitorDevice.replace("https://ontochain.recheck.io/", "");
        queryResult.data[d].organization = queryResult.data[d].organization.replace("https://ontochain.recheck.io/", "");
    }
}

module.exports = {
    queryByOrganizationAndTimeFrom,
    queryByOrganizationAndTimeFromAndTimeTo,
    queryByOrganizationAndGroupIdAndTimeFromAndTimeTo,
    nodeInfo,
    create,
    readUAL,
    query,
    transformForJasperStudio
}