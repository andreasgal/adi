const assert = require('assert');
const printf = require('printf');
const cache = require('persistent-cache')();
const request = require('request');

const utils = require('./utils');
const dateString = utils.dateString;
const forHistory = utils.forHistory;

function analyzeHistory(days) {
  let hdr = null;
  forHistory(days, date => {
    let data = cache.getSync(date);
    if (!data) {
      return;
    }
    data = JSON.parse(data);
    let fmt = [].concat(["Date", "Total", "Desktop", "Android", ],
                        data.Firefox.channel.map(x => "Desktop/" + x),
                        data.FennecAndroid.channel.map(x => "Android/" + x)).join(',');
    if (!hdr) {
      hdr = fmt;
      console.log(hdr);
    }
    assert(hdr === fmt);
    let desktop = data.Firefox.adi;
    let android = data.FennecAndroid.adi;
    let desktop_total = desktop.reduce((acc, val) => acc + val, 0);
    let android_total = android.reduce((acc, val) => acc + val, 0);
    let total = desktop_total + android_total;
    console.log([].concat([date, total, desktop_total, android_total], desktop, android).join(','));
  });
}

analyzeHistory(220);
