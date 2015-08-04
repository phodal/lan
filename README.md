# Lan

[![Build Status](https://travis-ci.org/phodal/lan.svg?branch=master)](https://travis-ci.org/phodal/lan)
[![Code Climate](https://codeclimate.com/github/phodal/lan/badges/gpa.svg)](https://codeclimate.com/github/phodal/lan)
[![Test Coverage](https://codeclimate.com/github/phodal/lan/badges/coverage.svg)](https://codeclimate.com/github/phodal/lan/coverage)

> A CoAP,MQTT,HTTP Server of Internet of Things.



##Test Function


###HTTP PUT

    curl -X PUT -d '{ "dream": 1 }' -H "Content-Type: application/json" http://localhost:8899/topics/test





##Setup

1.Install dependencies

    npm install

2.Run

    node app.js

Inspired by
[https://github.com/mcollina/qest](https://github.com/mcollina/qest)

##License

© 2015 [Phodal Huang][phodal]. This code is distributed under the MIT
license.

[phodal]:http://www.phodal.com/
