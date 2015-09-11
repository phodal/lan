var helper = require('../spec_helper');
var mqtt = require('mqtt');
var request = require('request');
var coap = require('coap');
var website = "http://localhost:8899/";
var assert = require('chai').assert;
var should = require('should');
var supertest = require('supertest');
var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;
var env = require("../../app.js");

describe('HTTP Services Test', function () {
  var app, server;
  app = env.configure();

  before(function () {
    server = app.listen(8899, function () {
    });
  });

  after(function () {
    server.close();
  });

  it('should able open homepage', function (done) {
    request.get('http://localhost:8899/',
      function (error, response) {
        if (response.statusCode === 200) {
          done();
        }
      })
  });

  it('should able connect to http server', function (done) {
    request.get('http://localhost:8899/topics/test', {
        'auth': {
          'username': 'root',
          'password': 'root'
        }
      },
      function (error, response) {
        if (response.statusCode === 200) {
          done();
        }
      })
  });

  it('should unable connect to http server when username error', function (done) {
    request.get('http://localhost:8899/topics/test', {
        'auth': {
          'username': 'root1',
          'password': 'phodal'
        }
      },
      function (error, response) {
        if (response.statusCode === 403) {
          done();
        }
      })
  });

  it('should unable connect to http server when password error', function (done) {
    request.get('http://localhost:8899/topics/test', {
        'auth': {
          'username': 'root',
          'password': 'phodal'
        }
      },
      function (error, response) {
        if (response.statusCode === 403) {
          done();
        }
      })
  });

  it('should return 401 when user not auth', function (done) {
    request('http://localhost:8899/topics/test',
      function (error, response) {
        if (response.statusCode === 401) {
          done();
        }
      })
  });


  it('should able put response', function (done) {
    request({
      uri: 'http://phodal:phodal@localhost:8899/topics/test',
      method: 'PUT',
      multipart: [
        {
          'content-type': 'application/json',
          body: JSON.stringify({
            foo: 'bar',
            _attachments: {'message.txt': {follows: true, length: 18, 'content_type': 'text/plain'}}
          })
        },
        {body: 'I am an attachment'}]
    }, function (error, response) {
      if (response.statusCode) {
        done();
      }
    })
  });

  it('should able put response', function (done) {
    request.put('http://localhost:8899/topics/test', {
      'auth': {
        'username': 'phodal',
        'password': 'phodal',
        'sendImmediately': true
      }
    }, function (error, response) {
      if (response.statusCode === 204) {
        done();
      }
    });
  });

  it('should able put response when username error', function (done) {
    request.put('http://localhost:8899/topics/test', {
      'auth': {
        'username': 'phodal1',
        'password': 'phodal',
        'sendImmediately': true
      }
    }, function (error, response) {
      if (response.statusCode === 403) {
        done();
      }
    })
  });

  it('should not able put response when password error', function (done) {
    request.put('http://localhost:8899/topics/test', {
      'auth': {
        'username': 'phodal',
        'password': 'root',
        'sendImmediately': true
      }
    }, function (error, response) {
      if (response.statusCode === 403) {
        done();
      }
    })
  });

  it('should able post response', function (done) {
    request({
      uri: 'http://localhost:8899/topics/test',
      method: 'POST',
      'auth': {
        'username': 'phodal',
        'password': 'phodal',
        'sendImmediately': true
      }
    }, function (error, response) {
      if (response.statusCode === 204) {
        done();
      }
    })
  });

  it('should able post response', function (done) {
    request({
      uri: 'http://localhost:8899/device/test',
      method: 'POST',
      'auth': {
        'username': 'phodal',
        'password': 'phodal',
        'sendImmediately': true
      }
    }, function (error, response) {
      if (response.statusCode === 204) {
        done();
      }
    })
  });
});
