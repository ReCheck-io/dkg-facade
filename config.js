;
var configToExport = {
    SERVER_PREFIX_PATH: '/dkg-facade',
    SERVER_PORT: '8000',
    OT_NODE_HOSTNAME : process.env['DKGFACADE_OT_NODE_HOSTNAME'],
    OT_NODE_PORT : process.env['DKGFACADE_OT_NODE_PORT'],
    PUBLIC_KEY : process.env['DKGFACADE_PUBLIC_KEY'],
    PRIVATE_KEY : process.env['DKGFACADE_PRIVATE_KEY'],
    DKGCLIENT_AUTH_TOKEN : process.env['DKGFACADE_DKGCLIENT_AUTH_TOKEN']
};

exports.config = function (r) {
    return configToExport;
};