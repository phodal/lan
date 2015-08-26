var WebSocket = require('ws');
var ws = new WebSocket('ws://root:root@127.0.0.1:8898/topics');

ws.on('open', function open() {
  ws.send('something');
  console.log('open');
});

ws.on('message', function (data) {
  console.log(data);
  process.exit(1);
  ws.close();
});
