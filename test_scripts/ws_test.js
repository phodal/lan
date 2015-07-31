var WebSocket = require('ws');
var ws = new WebSocket('ws://127.0.0.1:8080/');

ws.on('open', function open() {
  ws.send('something');
  console.log('open');
});

ws.on('message', function(data, flags) {
  console.log(data)
});