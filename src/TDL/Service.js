'use strict';

var bodyParser = require('body-parser');
var Control_Monad_Aff = require('../Control.Monad.Aff');
var Data_Either = require('../Data.Either');
var express = require('express');
var TDLJ = require('../TDL.Serializers.JSON');

exports.listen = function(conf) {
  return function(services) {
    return function() {
      var app = express();
      app.use(bodyParser.json({strict: false}));
      if (conf.enableCORS) {
        app.use(function(req, res, next) {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
          next();
        });
      }
      services.forEach(function(vs) {
        app.post('/v' + vs.version + '/' + vs.service.value0, function(req, res) {
          var i = TDLJ.deserialize(req.body);
          vs.service.value1(i)(function(o) {
            if (o instanceof Data_Either.Left) {
              res.status(500);
              res.end(o.value0);
            } else {
              res.status(200);
              res.json(TDLJ.serialize(o.value0));
            }
          }, function(err) {
            res.status(500);
            res.end('' + err);
          });
        });
      });
      app.listen(conf.port, conf.host);
      return Control_Monad_Aff.nonCanceler;
    };
  };
};
