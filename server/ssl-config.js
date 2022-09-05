var path = require('path');
var fs = require('fs');
exports.privateKey = fs.readFileSync(path.join(__dirname, './private/support.marksharks.com.key')).toString();
exports.certificate = fs.readFileSync(path.join(__dirname, './private/ssl-bundle.crt')).toString();
/** To be changed in development environment **/
// exports.privateKey = fs.readFileSync('/etc/ssl/marksharksplus.com.key');
// exports.certificate = fs.readFileSync('/etc/ssl/ssl-bundle.crt');
/** To be changed in live environment **/
// exports.privateKey = fs.readFileSync('/etc/ssl/support.marksharks.com.key');
// exports.certificate = fs.readFileSync('/etc/ssl/ssl-bundle.crt');
