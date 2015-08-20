var WebSocket = require('ws');
var ws = new WebSocket('ws://127.0.0.1:8898/');

ws.on('open', function open() {
  ws.send('something');
  console.log('open');
});

ws.on('message', function(data) {
  if(data==="connection") {
    process.exit(1)
  }
});
