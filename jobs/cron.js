var CronJob = require('cron').CronJob;
var migrate = require('./sqlite2mongodb');

var job = new CronJob({
  cronTime: '*/5 * * * * *',
  onTick: function () {
    'use strict';
    console.log('Migrate Start');
    migrate();
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();
