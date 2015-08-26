var CronJob = require('cron').CronJob;
var migrate = require('./sqlite2mongodb');

var job = new CronJob({
  cronTime: '*/15 * * * * *',
  onTick: function() {
    migrate();
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();
