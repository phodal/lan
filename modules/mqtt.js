module.exports = function (app) {
	return function (client) {
		client.on('connect', function (packet) {
			client.id = packet.client;
			return client.connack({
				returnCode: 0
			});
		});
		client.on('subscribe', function (packet) {
			console.log('subscribe');
			console.log(packet);
			return {status: 'subscribe'};
		});
		client.on('publish', function (packet) {
			console.log(payload);
			return {status: 'publish'};
		});
		client.on('pingreq', function (packet) {
			console.log('pingreq');
			console.log(packet);
			return {status: 'pingreq'};
		});
		client.on('disconnect', function () {
			console.log('disconnect');
			return {status: 'disconnect'};
		});
		client.on('error', function (error) {
			console.log(error);
			return {};
		});
		client.on('close', function (err) {
			console.log('close');
			return {};
		});
		return client.on('unsubscribe', function (packet) {
			console.log('unsubscribe');
			return {};
		});
	};
};
