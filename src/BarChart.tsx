import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const dataSet = [
  { inches: 350, resort: 'Big Sky', acres: 5432 },
  { inches: 400, resort: 'Vail', acres: 5900 },
  { inches: 239, resort: 'Whistler', acres: 10203 },
  { inches: 550, resort: 'Park City', acres: 4210 },
  { inches: 328, resort: 'Jackson Hole', acres: 3092 },
  { inches: 612, resort: 'Brighton', acres: 2084 },
];

const margin = {
  top: 20,
  bottom: 25,
  right: 25,
  left: 45
}

const BarChart = () => {
  const svgRef = useRef<any>();
  const chartGroup = useRef<any>();
  const xScale = useRef<any>();
  const yScale = useRef<any>();
  const xAxisDraw = useRef<any>();
  const yAxisDraw = useRef<any>();
  const [display, setDisplay] = useState<'inches' | 'acres'>('inches');

  const svgHeight = 550;
  const svgWidth = 550;
  const height = svgHeight - margin.top - margin.bottom;
  const width = svgWidth - margin.left - margin.right;

  const handleDisplayChange = useCallback(() => {
    return display === 'inches' ? setDisplay('acres') : setDisplay('inches');
  }, [display]);

  const displayOption = useMemo(() => (display === 'inches' ? 'acres' : 'inches'), [display]);

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr('width', svgWidth)
      .attr('height', svgHeight)

    chartGroup.current = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    xScale.current = d3.scaleBand().range([0, width]).padding(0.25);


    yScale.current = d3
      .scaleLinear()
      .range([height, 0]);
    
    yAxisDraw.current = chartGroup.current.append('g');
    xAxisDraw.current = chartGroup.current.append('g').attr('transform', `translate(0, ${height})`);
    xScale.current.domain(dataSet.map((d) => d.resort));
    const xAxis = d3.axisBottom(xScale.current);
    xAxisDraw.current.call(xAxis.scale(xScale.current));  

  }, [])
    
  useEffect(() => {
    yScale.current.domain([0, d3.max(dataSet.map((d) => d[display]))]);
    const yAxis = d3.axisLeft(yScale.current).ticks(5);

    chartGroup.current
      .selectAll('.bar')
      .data(dataSet, (d) => d.resort)
      .join(
        (enter) => 
          enter
            .append('rect')
            .attr('class', 'bar')
            .attr('width', xScale.current.bandwidth())
            .attr('height', 0)
            .attr('x', (d) => xScale.current(d.resort))
            .attr('y', yScale.current(0))
            .attr('fill', '#1E5690')
            .transition()
            .duration(500)
            .attr('height', (d) => height - yScale.current(d[display]))
            .attr('y', (d) => yScale.current(d[display])),
        (update) => 
          update
            .transition()
            .duration(500)
            .attr('height', (d) => height - yScale.current(d[display]))
            .attr('y', (d) => yScale.current(d[display])),
        (exit) => 
          exit
            .transition()
            .duration(500)
            .attr('height', 0)
            .attr('y', yScale.current(0))
            .remove()
    );
    yAxisDraw.current.transition().duration(500).call(yAxis.scale(yScale.current));

  }, [display]);
  return (
    <>
      <div className="barChartView">
        <button onClick={handleDisplayChange}>{`Change to ${displayOption}`}</button>
      </div>
      <svg ref={svgRef} />
    </>
  );
};

export default BarChart;
