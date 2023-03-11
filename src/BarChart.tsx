import * as d3 from 'd3';

const dataSet = [124, 400, 239, 24, 328, 488];

const BarChart = () => {
  const width = 500;
  const height = 500;
  const padding = 20;

  const svg = d3
    .select('#bar-chart-div')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  svg
    .selectAll('rect')
    .data(dataSet)
    .enter()
    .append('rect')
    .attr('x', (_x, i) => i * 25)
    .attr('y', (d) => height - d)
    .attr('width', 20)
    .attr('height', (d) => d);
  return <div id='bar-chart-div' style={{ height: 500, width: 500 }} />;
};

export default BarChart;
