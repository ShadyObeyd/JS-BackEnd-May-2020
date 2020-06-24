  module.exports = {
    development: {
        port: process.env.PORT || 3000,
        databaseUrl: 'mongodb://localhost/SharedTripp',
        privateKey: 'SharedTripp-Private-Key'
    },
    production: {}
};