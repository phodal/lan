var coap = require('coap');
var request = coap.request;
var bl = require('bl');
var req = request({hostname: 'localhost', port: 5683, pathname: 'topic', method: 'GET', query: 'root:root'});

req.setHeader("Accept", "application/json");
req.on('response', function (res) {
  res.pipe(bl(function(err, data) {
    console.log(data.toString());
    process.exit(0);
  }));
});

req.end();
