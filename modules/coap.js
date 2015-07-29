module.exports = function (app) {
	return function (req, res) {
		console.log(req.method);
		var handlerGet = function () {
			res.code = '2.05';
			res.end(JSON.stringify({method: 'get'}));
		};

		var handPost = function () {
			res.code = '2.06';
			res.end(JSON.stringify({method: 'post/put'}));
		};

		var other = function () {
			res.code = '4.04';
			res.end(JSON.stringify({method: "not support"}));
		};

		switch (req.method) {
			case "GET":
				handlerGet();
				break;
			case "PUT":
			case "POST":
				handPost();
				break;
			default:
				other();
				break;
		}
	};
};
