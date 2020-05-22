const homeHandler = require('./home');
const statisFiles = require('./static-files');
const catHandler = require('./cat');

module.exports = [homeHandler, statisFiles, catHandler];