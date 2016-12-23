'use strict'

var express = require('express'),
    path = require('path');
var express_config =require('./config/express.json');
var mongo_config =require('./config/mongo.json');

global.app = require('./lib/boot.js')({
    root_dir: __dirname,
    config: {
        mongo: mongo_config,
        express: express_config
    }
});

var http = app.http;

http.set_static(path.join(__dirname, 'static')); /* node-common function */
http.set('views', path.join(__dirname, 'views'));
http.set('view engine', 'jade');
http.require_controller('banks');
http.require_controller('clients');
http.require_controller('main', {is_root: true});


http.require_controller('providers');
http.require_controller('stocks');
http.require_controller('invoices');

require('./lib/models.js')(app);
