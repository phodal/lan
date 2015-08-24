# Lan

[![Build Status](https://travis-ci.org/phodal/lan.svg?branch=master)](https://travis-ci.org/phodal/lan)
[![Code Climate](https://codeclimate.com/github/phodal/lan/badges/gpa.svg)](https://codeclimate.com/github/phodal/lan)
[![Test Coverage](https://codeclimate.com/github/phodal/lan/badges/coverage.svg)](https://codeclimate.com/github/phodal/lan/coverage)

> A CoAP,MQTT,HTTP,WebSocket Server of Internet of Things.

Node Version: ``0.12.7``

IoT Architecture: 

![IoT Struct](docs/struct_full.png)

A similar project before this: [Ponte](https://github.com/eclipse/ponte)

Lan -> Server Layer:

![Lan Struct](docs/iot.jpg)

##TODO

2. pub/sub support (Phodal Ongoing)

3. Sync token to Mongodb(MQ or Cron)

4. add Auth support for WebSocket

5. example for Arduino、NodeMCU、51 ...

6. add RSA Support for WebSocket、MQTT、HTTP、CoAP

7. create docker image for deploy

###Done

1. basic auth for WebSocket,MQTT,HTTP,CoAP

2. setup database

3. module loader

4. add account register/login

5. configureable

6. add get data support

##Configure(in design)

Change ``config/config.json`` to setup Database.

Use ``bcrypt``, please install it .

    npm install --save bcrypt

Current design:

```javascript
{
  "encrypt": "crypto",
  "db_url": "mongodb://localhost:27017/lan",
  "db_collection": "documents",
  "modules": [
    "coap",
    "http",
    "mqtt",
    "websocket"
  ],
  "port": {
    "http": 8899,
    "websocket": 8898,
    "coap": 5683,
    "mqtt": 1883
  }
}
```

encrypt: ``crypto``, ``bcrypt``


##Docker

``Require``: Docker

    docker build .

##安装(Setup)

``必装``:

1. MongoDB
2. Sqlite 或者 MySQL

然后:

1.Clone

	git clone https://github.com/phodal/lan

2.安装依赖

    npm install
    bower install 
    
3.修改config下的配置

    /config.json 数据库配置
    /default.json Lan系统配置   

4.数据库初始化

    sequelize db:migrate
    
5.运行
 
    npm start    
    
##Setup

``require``: Install

1. ``MongoDB``
2. ``Sqlite`` or ``MySQL``

Then.

1.Install dependencies

    npm install

2.Setup Database

    sequelize db:migrate 

3.Run

    npm start
    

##Test With Tool

###HTTP 


    
Get 
    
    curl --user root:root -X GET -H "Content-Type: application/json" http://localhost:8899/topics/root

PUT/POST - cUrl
    curl --user root:root -X PUT -d '{ "dream": 1 }' -H "Content-Type: application/json" http://localhost:8899/topics/root


###MQTT 


PUT/POST - Mosquitto

    mosquitto_pub -u root -P root -h localhost -d -t lettuce -m "Hello, MQTT. This is my first message."

###CoAP 

GET

    coap-client -e "{message: 'hello,world}" -m put coap://127.0.0.1/topic?root:root

PUT/POST - libcoap

    coap-client -m get coap://127.0.0.1:5683/topic/root:root


Inspired by
[https://github.com/mcollina/qest](https://github.com/mcollina/qest)

##License

© 2015 [Phodal Huang][phodal]. This code is distributed under the MIT
license.

[phodal]:http://www.phodal.com/
