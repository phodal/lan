var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
	'use strict';
	res.render('index', {title: 'Lan'});
});

module.exports = router;
