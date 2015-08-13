# Lan

[![Build Status](https://travis-ci.org/phodal/lan.svg?branch=master)](https://travis-ci.org/phodal/lan)
[![Code Climate](https://codeclimate.com/github/phodal/lan/badges/gpa.svg)](https://codeclimate.com/github/phodal/lan)
[![Test Coverage](https://codeclimate.com/github/phodal/lan/badges/coverage.svg)](https://codeclimate.com/github/phodal/lan/coverage)

> A CoAP,MQTT,HTTP,WebSocket Server of Internet of Things.

A similar project before this: [Ponte](https://github.com/eclipse/ponte)

![Lan Struct](iot.jpg)


##Test With Tool

###HTTP PUT/POST - cUrl

    curl -X PUT -d '{ "dream": 1 }' -H "Content-Type: application/json" http://localhost:8899/topics/test

with authenticate

    curl --user root:root -X PUT -d '{ "dream": 1 }' -H "Content-Type: application/json" http://localhost:8899/topics/test


###MQTT PUT/POST - Mosquitto


    mosquitto_pub -h localhost -d -t lettuce -m "Hello, MQTT. This is my first message."
    
with authenticate

    mosquitto_pub -u root -P root -h localhost -d -t lettuce -m "Hello, MQTT. This is my first message."

###CoAP PUT/POST - libcoap

    coap-client -m get coap://127.0.0.1:5683/topics/zero -T
    
with authenticate

``Use CoAP Option for Authenticate``      
    
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
