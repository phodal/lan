var coap = require('coap');
var request = coap.request;
var bl = require('bl');
var req = request({hostname: 'localhost', port: 5683, pathname: '', method: 'GET'});

req.setHeader("Accept", "application/json");
req.setOption('Block2', [new Buffer('phodal'), new Buffer('phodal')]);
req.on('response', function (res) {
  console.log(res.payload.toString());
  res.pipe(bl(function(err, data) {
    console.log(data);
    process.exit(0);
  }));
});

req.end();
