function csv(url) {
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      let rows = text.split('\n').filter(line => line !== '').map(line => line.split(','));
      return {
        labels: rows.shift(),
        data: rows.map(row => row.map((value, n) => (n === 0) ? new Date(value) : +value)),
      };
    });
}

let graph = 'daily';
let smoothing = 90;
let product = 'Desktop';
let percentage = false;

function plot(url, index) {
  csv(url).then(input => {
    return {
      labels: input.data.map(v => v[0].toString()),
      series: [input.data.map(v => v[index])],
    };
  }).then(data => {
    console.log(data);
    let options = {
      chartPadding: {
        top: 65,
        bottom: 65,
        left: 20,
        right: 45,
      },
      axisX: {
        labelInterpolationFnc: function(value, index) {
          if ((index % 30) !== 0) return null;
          let parts = value.split(' ');
          return parts[1] + ' ' + parts[3];
        }
      },
      axisY: {
        labelInterpolationFnc: function(value) {
          return percentage ? (Math.floor(value) + '%') : (Math.floor(value / 100000)/10 + 'M');
        }
      },
    };
    new Chartist.Line('.ct-chart', data, options);
  }).catch(e => console.error(e));
}

function select(what) {
  switch (what) {
  case 'Daily':
    graph = 'daily';
    break;
  case 'Year over Year':
    graph = 'delta';
    break;
  case '7 days':
  case '30 days':
  case '90 days':
    smoothing = +what.split(' ')[0];
    break;
  case 'Desktop':
  case 'Android':
  case 'Both':
    product = what;
    break;
  case 'Absolute':
    percentage = false;
    break;
  case 'Relative':
    percentage = true;
    break;
  }
  refresh();
}

function highlight(selector, text, classname) {
  document.querySelectorAll(selector).forEach(e => {
    if (e.innerText === text) {
      e.classList.add(classname);
    } else {
      e.classList.remove(classname);
    }
  });
}

function refresh() {
  let index = {
    'Both': {
      daily: [1, 1],
      delta: [5, 6],
    },
    'Desktop': {
      daily: [2, 2],
      delta: [1, 2],
    },
    'Android': {
      daily: [3, 3],
      delta: [3, 4],
    },
  }[product][graph][percentage ? 1 : 0];
  plot('https://raw.githubusercontent.com/andreasgal/adi/master/' + graph + ((graph === 'delta') ? smoothing : '') + '.csv', index);
  document.querySelectorAll('.smoothing,.percentage').forEach(e => {
    e.style.display = (graph === 'delta') ? 'inline' : 'none';
  });
  highlight('.button.graph', (graph === 'daily') ? 'Daily' : 'Year over Year', 'selected');
  highlight('.button.product', product, 'selected');
  highlight('.button.smoothing', smoothing + ' days', 'selected');
  highlight('.button.percentage', percentage ? 'Relative' : 'Absolute', 'selected');
}

/* attach event handlers to all menu buttons */
document.querySelectorAll("span.button").forEach(e => {
  e.onclick = e => select(e.toElement.innerText);
});

select('Daily');
