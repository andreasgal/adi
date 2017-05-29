const assert = require('assert');
const printf = require('printf');

// return a date string for a specific day in the past (2017-05-27)
function dateString(daysIntoThePast) {
  let d = new Date();
  let tz_ms = d.getTimezoneOffset() * 60 * 1000;
  d.setTime(Date.now() - tz_ms - daysIntoThePast * 24 * 60 * 60 * 1000);
  return printf('%04u-%02u-%02u', d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// run closure for the last 'days' days, passing the date
function forHistory(days, closure) {
  for (let i = 1; i <= days; ++i) {
    let d = dateString(i);
    if (d === '2017-01-24' || d === '2017-01-25') {
      // server returned an internal error for these, so we don't have data for them
      continue;
    }
    if (d === '2017-02-08') {
      // numbers seem to be wildly off for this day
      continue;
    }
    closure(d, i);
  }
}

module.exports = {
  dateString: dateString,
  forHistory: forHistory,
};
