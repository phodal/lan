var Database = require('../persistence/mongo');
var db = new Database();

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

module.exports = function (app) {
	return function (req, res) {
		console.log(req.method);
		var handlerGet = function () {
			res.code = '2.05';
			res.end(JSON.stringify({method: 'get'}));
		};

		var handPost = function () {
      var payload = req.payload.toString();
      if(!isJson(payload)){
        payload = {'data': payload};
      }
      db.insert(payload);
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
