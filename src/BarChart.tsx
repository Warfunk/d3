import * as d3 from 'd3';
import { LegacyRef, RefObject, useEffect, useRef } from 'react';

const dataSet = [124, 400, 239, 24, 328, 488];

const BarChart = () => {
  const svgRef = useRef<any>();
  const width = 550;
  const height = 550;
  const marginRight = 25;
  const marginLeft = 35;
  const marginTop = 20;
  const marginBottom = 25;
  const svgHeight = height - marginTop - marginBottom;
  const svgWidth = width - marginLeft - marginRight;

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('background', '#B0BBBF');

    const chartGroup = svg
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

    const xScale = d3.scaleBand().range([0, svgWidth]);
    xScale.domain(dataSet.map((d) => `${d}`)).padding(0.15);

    const yScale = d3.scaleLinear().domain([0, 500]).range([svgHeight, 0]);

    const yAxis = d3.axisLeft(yScale).ticks(5);
    svg
      .append('g')
      .call(yAxis)
      .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

    chartGroup
      .selectAll('rect')
      .data(dataSet)
      .enter()
      .append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => d)
      .attr('x', (d) => xScale(`${d}`))
      .attr('y', (d) => svgHeight - d)
      .attr('fill', '#5B8E7D');
  }, []);
  return <svg ref={svgRef} style={{ width: 550, height: 550 }} />;
};

export default BarChart;
