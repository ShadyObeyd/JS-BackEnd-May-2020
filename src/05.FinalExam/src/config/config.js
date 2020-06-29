module.exports = {
    development: {
        port: process.env.PORT || 3000,
        databaseUrl: 'mongodb://localhost/Theater',
        privateKey: 'Theater-Private-Key'
    },
    production: {}
};