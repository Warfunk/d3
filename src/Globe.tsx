import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
const Globe = () => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [rotate, setRotate] = useState<[number, number]>([0, -25]);
  const svgRef = useRef<any>();
  const mapGroup = useRef<any>();
  const graticuleGroup = useRef<any>();
  const projection = useRef<any>();
  let graticule = d3.geoGraticule().step([10, 10]);
  let width = 400,
    height = 400;
  useEffect(() => {
    fetch(
      'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson'
    )
      .then((resp) => resp.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    if (!data) return;
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    svg
      .append('circle')
      .attr('cx', 200)
      .attr('cy', 200)
      .attr('r', 200)
      .attr('fill', '#00b7e4');
    mapGroup.current = svg
      .append('g')
      .attr('class', 'map')
      .attr('width', width)
      .attr('height', height);
    graticuleGroup.current = svg
      .append('g')
      .attr('class', 'geo')
      .attr('width', width)
      .attr('height', height);
  }, [data]);
  useEffect(() => {
    if (!data) return;
    projection.current = d3
      .geoOrthographic()
      .fitSize([width, height], data)
      .rotate(rotate);
    let geoGenerator = d3.geoPath().projection(projection.current);
    mapGroup.current
      .selectAll('.path')
      .data(data.features)
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'path')
            .attr('d', geoGenerator)
            .attr('fill', '#333333')
            .attr('stroke', '#6a6a6a')
            .attr('stroke-width', '1px'),
        (update) => update.attr('d', geoGenerator)
      );
    graticuleGroup.current
      .selectAll('.graticule')
      .data([graticule()])
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'graticule')
            .attr('stroke-width', '0.5px')
            .attr('stroke', '#ECECEC')
            .attr('d', geoGenerator)
            .attr('fill-opacity', 0),
        (update) => update.attr('d', geoGenerator),
        (exit) => exit.remove()
      );
  }, [data, rotate]);
  window.requestAnimationFrame(() => {
    setRotate((current) => {
      const new1 = current[0] === 360 ? 0 : current[0] + 0.1;
      const new2 = current[1];
      return [new1, new2];
    });
  });
  return loading ? (
    <h2>Loading...</h2>
  ) : (
    <>
      <svg ref={svgRef} />
    </>
  );
};
export default Globe;
