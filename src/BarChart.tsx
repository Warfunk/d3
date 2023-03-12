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
      .attr('height', height);

    const xScale = d3.scaleBand().range([0, width]);
    xScale.domain(dataSet.map((d) => `${d}`)).padding(0.3);

    svg
      .selectAll('rect')
      .data(dataSet)
      .enter()
      .append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => d)
      .attr('x', (d) => xScale(`${d}`))
      .attr('y', (d) => height - d)
      .attr('fill', 'blue');
  }, []);
  return (
    <svg ref={svgRef} style={{ height: 500, background: 'grey', width: 500 }} />
  );
};

export default BarChart;
