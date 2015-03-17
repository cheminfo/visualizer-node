"use strict";

var debug = require('debug')('main'),
    appconfig = require('./appconfig.json'),
    network = require('./util/network'),
    Promise = require('bluebird'),
    express = require('express'),
    _ = require('lodash'),
    app = express(),
    bodyParser = require('body-parser');


// The static directory is where all the statically served files go
// Like jpg, js, css etc...
app.use(express.static(__dirname + '/static'));

app.use(bodyParser.json({
    limit: '5mb'
}));
app.use(bodyParser.urlencoded({
    limit: '5mb',
    extended: true
}));

var ipaddress = appconfig.ipaddress || '';
var ipValid = network.validateIp(ipaddress);
app.set("port", appconfig.port || 80);
app.set("ipaddr", ipValid ? appconfig.ipaddress : ''); // by default we listen to all the ips
app.set("serveraddress", ipValid ? appconfig.ipaddress : network.getMyIp() || '127.0.0.1');


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Initialize modules
var modules = ['navview'];
debug('Mounting modules', modules);

for(var i=0; i<modules.length; i++) {
    var router = require('./routes/'+modules[i]);
    app.use('/'+modules[i], router);
}

app.get('/', function(req,res) {
    res.set('Cache-Control', 'no-cache');
    res.redirect(301, '/visualizer/src/index.html?config=/configs/default.json');
});
var http = require("http").createServer(app);
http.listen(app.get("port"), app.get("ipaddr"), function() {
    console.log('Server launched. Go to ', "http://" + app.get("serveraddress") + ":" + app.get("port"));
});