module.exports = {
    development: {
        port: process.env.PORT || 3000,
        databaseUrl: 'mongodb://localhost/VideoTutorials',
        privateKey: 'VideoTutorials-Private-Key'
    },
    production: {}
};