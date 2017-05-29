const assert = require('assert');
const fs = require('fs');
const printf = require('printf');
const cache = require('persistent-cache')();

const utils = require('./utils');
const dateString = utils.dateString;
const forHistory = utils.forHistory;

function average(list) {
  return list.reduce((acc, val) => acc + val, 0) / list.length;
}

function analyzeHistory() {
  let year = 365;
  let two_years = year * 2;
  let hdr = null;
  let daily = [];
  let map = {};
  forHistory(two_years, date => {
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
    }
    assert(hdr === fmt);
    let desktop = data.Firefox.adi;
    let android = data.FennecAndroid.adi;
    let desktop_total = desktop.reduce((acc, val) => acc + val, 0);
    let android_total = android.reduce((acc, val) => acc + val, 0);
    let total = desktop_total + android_total;
    let values = [].concat([date, total, desktop_total, android_total], desktop, android);
    map[date] = values;
    daily.push(values.join(','));
  });
  daily.push(hdr);
  fs.writeFileSync('daily.csv', daily.reverse().join('\n') + '\n', 'utf8');
  // now compare each 7 day window with the previous year
  let delta7 = [];
  forHistory(year - 7, (date, i) => {
    // fetch a specific value for the 7 day window starting with day 'j'
    function lookup(j, N) {
      let result = [];
      for (k = j; k < j + 7; ++k) {
        let d = dateString(k);
        let v = map[d];
        if (v) {
          result.push(v[N]);
        }
      }
      return result;
    }
    function delta(N) {
      let this_year = lookup(i, N);
      let last_year = lookup(year + i, N);
      return average(this_year) - average(last_year);
    }
    let delta_desktop = delta(2);
    let delta_android = delta(3);
    let today = map[date];
    let total_desktop = today[2];
    let total_android = today[3];
    delta7.push([date, delta_desktop, delta_desktop/total_desktop*100, delta_android, delta_android/total_android*100].join(','));
  });
  delta7.push(["Date", "Desktop", "Android"].join(','));
  fs.writeFileSync('delta.csv', delta7.reverse().join('\n') + '\n');
}

analyzeHistory();
