import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const dataSet = [
  { inches: 44, month: 'November', cm: 112 },
  { inches: 400, month: 'December', cm: 1016 },
  { inches: 239, month: 'January', cm: 607 },
  { inches: 190, month: 'February', cm: 482 },
  { inches: 328, month: 'March', cm: 833 },
  { inches: 250, month: 'April', cm: 635 },
];

const BarChart = () => {
  const svgRef = useRef<any>();
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  const width = 550;
  const height = 550;
  const marginRight = 25;
  const marginLeft = 35;
  const marginTop = 20;
  const marginBottom = 25;
  const svgHeight = height - marginTop - marginBottom;
  const svgWidth = width - marginLeft - marginRight;

  const handleUnitChange = useCallback(() => {
    return unit === 'inches' ? setUnit('cm') : setUnit('inches');
  }, []);
  const unitOption = useMemo(() => (unit === 'inches' ? 'cm' : 'inches'), []);

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
    xScale.domain(dataSet.map((d) => `${d[unit]}`)).padding(0.15);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataSet.map((d) => d[unit]))])
      .range([svgHeight, 0]);

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
      .attr('height', (d) => svgHeight - yScale(d[unit]))
      .attr('x', (d) => xScale(`${d[unit]}`))
      .attr('y', (d) => yScale(d[unit]))
      .attr('fill', '#5B8E7D');
  }, [unit]);
  return (
    <>
      <button onClick={handleUnitChange}>{`Change to ${unitOption}`}</button>
      <svg ref={svgRef} style={{ width: 550, height: 550 }} />
    </>
  );
};

export default BarChart;
