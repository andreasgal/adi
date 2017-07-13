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

function plot(url, index) {
  csv(url).then(input => {
    return {
      labels: input.data.map(v => v[0].toString()),
      series: [input.data.map(v => v[index])],
    };
  }).then(data => {
    let options = {
      chartPadding: 50,
      axisX: {
        labelInterpolationFnc: function(value, index) {
          if ((index % 30) !== 0) return null;
          let parts = value.split(' ');
          return parts[1] + ' ' + parts[3];
        }
      },
      axisY: {
        labelInterpolationFnc: function(value) {
          return Math.floor(value / 1000000) + 'M';
        }
      },
    };
    new Chartist.Line('.ct-chart', data, options);
  }).catch(e => console.error(e));
}

let graph = 'daily';
let smoothing = '7';

function select(what) {
  switch (what) {
  case 'Daily':
    graph = 'daily';
    refresh();
    return;
  case 'Year over Year':
    graph = 'delta';
    refresh();
    return;
  case '7 days':
  case '30 days':
  case '90 days':
    smoothing = +what.split(' ')[0];
    refresh();
    break;
  }
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
  plot('https://raw.githubusercontent.com/andreasgal/adi/master/' + graph + ((graph === 'delta') ? smoothing : '') + '.csv', 1);
  document.querySelectorAll('.smoothing').forEach(e => {
    e.style.display = (graph === 'delta') ? 'inline' : 'none';
  });
  highlight('.button.graph', (graph === 'daily') ? 'Daily' : 'Year over Year', 'selected');
  highlight('.button.smoothing', smoothing + ' days', 'selected');
}

/* attach event handlers to all menu buttons */
document.querySelectorAll("span.button").forEach(e => {
  e.onclick = e => select(e.toElement.innerText);
});

select('Daily');