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

function analyzeHistory(window) {
  let year = 365;
  let three_years = year * 3;
  let hdr = ["Date", "Total", "Desktop", "Android"];
  let daily = [];
  let map = {};
  forHistory(three_years, date => {
    let data = cache.getSync(date);
    if (!data) {
      return;
    }
    data = JSON.parse(data);
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
  // now compare each [window] day window with the previous year
  let deltaWindow = [];
  forHistory(year * 2 - window, (date, i) => {
    // fetch a specific value for the [window] day window starting with day 'j'
    function lookup(j, N) {
      let result = [];
      for (k = j; k < j + window; ++k) {
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
    let total_desktop = average(lookup(i, 2));
    let total_android = average(lookup(i, 3));
    let delta_both = delta_desktop + delta_android;
    let total_both = total_desktop + total_android;
    deltaWindow.push([date, delta_desktop, delta_desktop/total_desktop*100, delta_android, delta_android/total_android*100, delta_both, delta_both/total_both*100].join(','));
  });
  deltaWindow.push(["Date", "Desktop/Delta", "Desktop/Delta%", "Android/Delta", "Android/Delta%", "Total/Delta", "Total/Delta%"].join(','));
  fs.writeFileSync('delta' + window + '.csv', deltaWindow.reverse().join('\n') + '\n');
}

analyzeHistory(7);
analyzeHistory(30);
analyzeHistory(90);
