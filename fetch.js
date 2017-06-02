const assert = require('assert');
const printf = require('printf');
const cache = require('persistent-cache')();
const request = require('request');

const utils = require('./utils');
const dateString = utils.dateString;
const forHistory = utils.forHistory;

// filter the result for the data we care about
function parse(request_date, result) {
  if (result.indexOf('Internal Server Error') >= 0) {
    console.log(request_date + ' server error');
    return null;
  }
  result = result.split('\n');
  result = result.map(line => line.trim());
  result = result.filter(line => line.startsWith('var '));
  assert(result.length === 2);
  let [result_data, result_date] = result;
  assert(result_data.startsWith('var data = ') && result_data.endsWith(';'));
  assert(result_date.startsWith('var date = ') && result_date.endsWith(';'));
  result_data = result_data.substr(11, result_data.length - 12);
  result_date = result_date.substr(11, result_date.length - 12).replace(/\"/g, '');
  assert(result_date === request_date);
  return result_data;
}

// fetch the last 'days' days worth of data
function fetchHistory(days) {
  forHistory(days, request_date => {
    cache.get(request_date, (err, result) => {
      if (err) {
        throw err;
      }
      if (typeof result === 'undefined') {
        console.log('fetching ' + request_date);
        request('https://www.arewestableyet.com/dashboard/dashboard?date=' + request_date, (err, response, body) => {
          if (err) {
            throw err;
          }
          console.log('caching ' + request_date);
          cache.putSync(request_date, parse(request_date, body));
        });
      }
    });
  });
}

fetchHistory(1260);
