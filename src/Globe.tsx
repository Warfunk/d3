import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const resortCoordinates = {
  features: [
    { 
      geometry: {
        type: "Point",
        coordinates: [-106.3550, 39.6061]
      },
      properties: {
        resort: 'Vail'
      },
      type: "Feature"
    }
  ] 
};

const sensitivity = 75
const Globe = () => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [rotate, setRotate] = useState<[number, number]>([0, 0]);
  const svgRef = useRef<any>();
  const mapGroup = useRef<any>();
  const graticuleGroup = useRef<any>();
  const resortGroup = useRef<any>();
  const projection = useRef<any>();
  let graticule = d3.geoGraticule().step([10, 10]);
  const width = 400;
  const height = 400;

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
    const dragstarted = (e) => null
    

    const dragged = (e) =>{
      const k = sensitivity / projection.current.scale()
      setRotate((current) => [current[0] + e.dx * k , current[1] - e.dy * k]);
    };

    const  drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged);

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('cursor', 'pointer')
      .call(drag);

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

    resortGroup.current = svg
      .append('g')
      .attr('class', 'resorts')
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

    resortGroup.current
      .selectAll('.resort')
      .data(resortCoordinates.features)
      .join(
        (enter) =>
          enter
            .append('circle')
            .attr('class', 'resort')
            .attr('r', 5)
            .attr('cx', d => {
              const currentXRotation = - projection.current.rotate()[0];
              const long = d.geometry.coordinates[0];
              const scaledRotation = Math.abs(currentXRotation) > 180 ? - (360 - currentXRotation) : currentXRotation
              const xValue: number = projection.current(d.geometry.coordinates)[0];
              return Math.abs(scaledRotation - long) < 90 ? xValue : -100;
            })
            .attr('cy', d => {
              const currentYRotation = - projection.current.rotate()[1];
              const long = d.geometry.coordinates[1];
              const scaledRotation = Math.abs(currentYRotation) > 180 ? - (360 - currentYRotation) : currentYRotation
              const yValue: number = projection.current(d.geometry.coordinates)[1];
              return Math.abs(scaledRotation - long) < 90 ? yValue : -100;
            })
            .attr('fill', 'red')
            .on('mouseenter', (_d, i) => console.log(i)),
        (update) => 
          update
            .attr('d', geoGenerator)
            .attr('cx', d => {
              const currentXRotation = - projection.current.rotate()[0];
              const long = d.geometry.coordinates[0];
              const scaledRotation = Math.abs(currentXRotation) > 180 ? - (360 - currentXRotation) : currentXRotation
              const xValue: number = projection.current(d.geometry.coordinates)[0];
              return Math.abs(scaledRotation - long) < 90 ? xValue : -100;
            })
            .attr('cy', d => {
              const currentYRotation = - projection.current.rotate()[1];
              const long = d.geometry.coordinates[1];
              const scaledRotation = Math.abs(currentYRotation) > 180 ? - (360 - currentYRotation) : currentYRotation
              const yValue: number = projection.current(d.geometry.coordinates)[1];
              return Math.abs(scaledRotation - long) < 90 ? yValue : -100;
            })
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
