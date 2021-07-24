var JSON_SERVER = require("json-server");
var ROUTER = JSON_SERVER.router('./db/db.json');


generateToken = () => {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

}


exports.JSON_SERVER = JSON_SERVER
exports.ROUTER = ROUTER
exports.generateToken = generateToken