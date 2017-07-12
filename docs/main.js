var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 70},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let label = 'Delta';

var parseTime = d3.timeParse("%Y-%m-%d");

var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var line = d3.line()
    .x(function(d) { return x(d.Date); })
    .y(function(d) { return y(d[label]); });

d3.csv("https://raw.githubusercontent.com/andreasgal/adi/master/delta7.csv", function(d) {
  d.Date = parseTime(d.Date);
  d[label] = +d[label];
  return d;
}, function(error, data) {
  if (error) throw error;

  x.domain(d3.extent(data, function(d) { return d.Date; }));
  y.domain(d3.extent(data, function(d) { return d[label]; }));

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .select(".domain")
      .remove();

  g.append("g")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "1em")
      .attr("text-anchor", "end")
      .text("ADI");

  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", line);
});
