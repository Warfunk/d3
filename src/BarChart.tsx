import * as d3 from 'd3';
import { LegacyRef, RefObject, useEffect, useRef } from 'react';

const dataSet = [124, 400, 239, 24, 328, 488];

const BarChart = () => {
  const svgRef = useRef<any>();
  const width = 500;
  const height = 500;
  const padding = 20;

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', 'translate(25,25)');

    const xScale = d3.scaleBand().range([0, width]);
    xScale.domain(dataSet.map((d) => `${d}`)).padding(0.3);

    const yScale = d3.scaleLinear().domain([0, 500]).range([height, 0]);

    const yAxis = d3.axisLeft(yScale);
    svg.append('g').call(yAxis).attr('transform', 'translate(40,40)');

    svg
      .selectAll('rect')
      .data(dataSet)
      .enter()
      .append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => d)
      .attr('x', (d) => xScale(`${d}`) + 25)
      .attr('y', (d) => height - d)
      .attr('fill', '#5B8E7D');
  }, []);
  return (
    <svg
      ref={svgRef}
      style={{ height: 600, background: '#B0BBBF', width: 600 }}
    />
  );
};

export default BarChart;
