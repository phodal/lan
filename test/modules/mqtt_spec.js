var mqtt = require('mqtt');
var mqttModule = require('../../modules/mqtt');

describe('MQTT Module', function () {
	it("spec name", function () {
		mqtt.createServer(mqttModule).listen(1884, function () {
			console.log("mqtt server listening on port %d", 1884);
		});
	});
});