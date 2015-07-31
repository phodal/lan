module.exports = function (app) {
	return function(server){
		server.on('connection', function (socket) {
			socket.send('connection');
			socket.on('subscribe', function (topic) {
				console.log(topic);
			});
			return socket.on('disconnect', function () {
				console.log('disconnect');
			});
		})
	};
};
