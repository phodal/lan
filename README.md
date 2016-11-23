# Lan IoT Server

[![Build Status](https://travis-ci.org/phodal/lan.svg?branch=master)](https://travis-ci.org/phodal/lan)
[![Code Climate](https://codeclimate.com/github/phodal/lan/badges/gpa.svg)](https://codeclimate.com/github/phodal/lan)
[![Test Coverage](https://codeclimate.com/github/phodal/lan/badges/coverage.svg)](https://codeclimate.com/github/phodal/lan/coverage)

> Internet of Things Server Layer with CoAP, WebSocket, MQTT, HTTP Protocol.

Inspired by [Qest](https://github.com/mcollina/qest) 

Test on Node Version: ``0.12``,``v4``,``v5``

##Architecture: 

![IoT Struct](docs/struct.png)

详细可见：《自己动手设计物联网》

![Designiot](http://ebook.designiot.cn/designiot.jpg)

立即购买：[亚马逊](https://www.amazon.cn/dp/B01IBZWTWW/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=BDXF90QZX6WX&coliid=I19EB97K0GNLW8)、[京东](http://search.jd.com/Search?keyword=%E8%87%AA%E5%B7%B1%E5%8A%A8%E6%89%8B%E8%AE%BE%E8%AE%A1%E7%89%A9%E8%81%94%E7%BD%91&enc=utf-8&wq=%E8%87%AA%E5%B7%B1%E5%8A%A8%E6%89%8B%E8%AE%BE%E8%AE%A1%E7%89%A9%E8%81%94%E7%BD%91&pvid=k24y6hri.l4xi28)

##Lan Server Layer:

![Lan Struct](docs/iot.jpg)

##配置

默认配置:

```javascript
{
  "encrypt": "crypto",
  "db_url": "mongodb://localhost:27017/lan",
  "db_collection": "documents",
  "db_collection_user": "user",
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
  },
  "logging" :true,
  "secret": "keyboard cat"
}
```

encrypt: ["crypto", "bcrypt"]

modules: ["coap", "http", "mqtt", "websocket"]

Use ``bcrypt``, please install it:

    npm install --save bcrypt

##Docker

``Require``: Docker

    docker build .

##安装(Setup)

``必装``:

1. MongoDB -> NoSQL: 数据存储
2. Sqlite || MySQL || PostgreSQL || MariaDB || MSSQL -> SQL: 存储用户信息

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

    npm install -g sequelize-cli
    sequelize db:migrate
    
5.Start Cron
 
    npm jobs/cron.js
    
6.运行
 
    npm start    
    
##Setup

``require``: Install

1. ``MongoDB``
2. Sqlite || MySQL || PostgreSQL || MariaDB || MSSQL -> SQL: save user info

Then.

1.Install dependencies

    npm install

Or Just Production only:

    npm install --production

2.Setup Database

    sequelize db:migrate 

    
3.Start Cron
 
    node jobs/cron.js

4.Run

    npm start

##Test With Tool

###HTTP 

Get 
    
    curl --user root:root -X GET -H "Content-Type: application/json" http://localhost:8899/topics/root

PUT/POST - cUrl

    curl --user root:root -X PUT -d '{ "dream": 1 }' -H "Content-Type: application/json" http://localhost:8899/topics/root

###MQTT 

Publish - Mosquitto

    mosquitto_pub -u root -P root -h localhost -d -t lettuce -m "Hello, MQTT. This is my first message."

Subscribe - Mosquitto

    mosquitto_sub -t message -h localhost -u root -P root

###CoAP 

POST/PUT - libcoap

    coap-client -e "{message: 'hello,world}" -m put coap://127.0.0.1/topic?root:root

GET - libcoap

    coap-client -m get coap://127.0.0.1:5683/topic?root:root
    
GET/POST/PUT - Copper
    
1. Visit [coap://127.0.0.1:5683/topic?root:root](coap://127.0.0.1:5683/topic?root:root)

GET: Click ``GET``

POST: Type on ``Outgoing``, Click ``POST``

###WebSocket

Message

    node test_scripts/ws_test.js

##Auth

Standalone (单机)

``User`` -> ``SQL Database`` (Auth)

``SQL Database`` -> ``NoSQL`` (Save) 

Multi 

``User`` -> ``SQL Database`` (Save)

``SQL Database`` -> ``NoSQL`` (Cron Job || MQ)
 
``User`` -> ``NoSQL`` (Auth && Save)

##License

© 2015~2016 [Phodal](https://www.phodal.com/). This code is distributed under the MIT license.
