module.exports = {
    SERVER_PREFIX_PATH: '/dkg-facade',
    SERVER_PORT: '8000',
    OT_NODE_HOSTNAME : process.env['DKGFACADE_OT_NODE_HOSTNAME'],
    OT_NODE_PORT : process.env['DKGFACADE_OT_NODE_PORT'],
    WRITE_PUBLIC_KEY : process.env['DKGFACADE_WRITE_PUBLIC_KEY'],
    WRITE_PRIVATE_KEY : process.env['DKGFACADE_WRITE_PRIVATE_KEY'],
    READ_PUBLIC_KEY : process.env['DKGFACADE_READ_PUBLIC_KEY'],
    READ_PRIVATE_KEY : process.env['DKGFACADE_READ_PRIVATE_KEY'],
    DKGCLIENT_AUTH_TOKEN : process.env['DKGFACADE_DKGCLIENT_AUTH_TOKEN']
};