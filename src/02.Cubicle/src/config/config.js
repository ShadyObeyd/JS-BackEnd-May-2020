module.exports = {
    development: {
        port: process.env.PORT || 3000,
        databaseUrl: 'mongodb://localhost/Cubicle',
        privateKey: 'Cubicle-Private-Key'
    },
    production: {}
};