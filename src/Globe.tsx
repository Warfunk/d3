import { HtmlHTMLAttributes, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import resortCoordinates from './data/resort.js'

const Tooltip = ({children, className}: HtmlHTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={className} style={{ background: 'white', position: 'absolute', borderRadius: 5, padding: 10}}>
      {children}
    </div>
  )
}

const fadeIn = (el) => el.transition().duration(200).style('opacity', 1);
const fadeOut = (el) => el.transition().duration(200).style('opacity', 0);

const sensitivity = 75;
const width = 400;
const height = 400;

const Globe = () => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(200);
  const [rotate, setRotate] = useState<[number, number]>([0, 0]);

  // Layers
  const svgRef = useRef<any>();
  const mapGroup = useRef<any>();
  const graticuleGroup = useRef<any>();
  const resortGroup = useRef<any>();
  const oceansGroup = useRef<any>();
  const projection = useRef<any>();
  // const tooltip = useRef<any>();

  const graticule = d3.geoGraticule().step([10, 10]);

  useEffect(() => {
    fetch(
      'src/data/topocountries.json'
    )
      .then((resp) => resp.json())
      .then((d) => {
        setData(topojson.feature(d, d.objects.countries));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data) return;
    const dragstarted = (e) => null
    

    const dragged = (e) => {
      const k = sensitivity / projection.current.scale();
      setRotate((current) => {
        const updatedX = current[0] + e.dx * k;
        const updatedY = Math.abs(current[1] - e.dy * k) > 45 ? current[1] : current[1] - e.dy * k;
        return [ updatedX, updatedY]
      });
    };

    const  drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged);

    const zoom = d3.zoom().on('zoom', (e) => {
      const k = e.transform.k
      setScale(200 * k);
    })

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('cursor', 'pointer')
      .call(drag)
      .call(zoom);

    oceansGroup.current = svg
      .append('g')
      .attr('width', width)
      .attr('height', height);

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
      .scale(scale)
      .rotate(rotate);
    const geoGenerator = d3.geoPath().projection(projection.current).pointRadius(3);

    d3.selectAll('.oceans').remove();
    oceansGroup.current     
      .append('circle')
      .attr('class', 'oceans')
      .attr('cx', 200)
      .attr('cy', 200)
      .attr('r', scale)
      .attr('fill', '#00b7e4'); 

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
            .append('path')
            .attr('class', 'resort')
            .attr('d', geoGenerator)
            .attr('fill', 'red')
            .attr('cursor', 'pointer'),
        (update) => 
          update
            .attr('d', geoGenerator)
      );
  }, [data, rotate, scale]);

  useEffect(() => {
    if (!data) return;
    const tooltip = d3.select('.tooltip');
    const handleMouseOver = (e, i) => {
      const [x, y] = projection.current(i.geometry.coordinates);
      tooltip
        .style('left', `${x + 5}px`)
        .style('top', `${y}px`)
        .html(
          `<h5 class="resortName">${i.properties.resort}</h5>
          <h6>Acreage: ${i.properties.acres}<h6>
          <h6>Average Snow: ${i.properties.averageSnowfall}<h6>
          `
        )
        .call(fadeIn);
    };
    const handleMouseLeave = () => {
      tooltip
        .style('left', -100)
      tooltip.call(fadeOut);
    };
    resortGroup.current
      .selectAll('.resort')
      .on('mouseover', handleMouseOver)
      .on('mouseleave', handleMouseLeave);
  }, [data, scale, rotate]);

  // window.requestAnimationFrame(() => {
  //   setRotate((current) => {
  //     const new1 = current[0] === 360 ? 0 : current[0] + 0.1;
  //     const new2 = current[1];
  //     return [new1, new2];
  //   });
  // });
  return loading ? (
    <h2>Loading...</h2>
  ) : (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ height: height, position: 'relative', width: width}}>
        <Tooltip className="tooltip" />
        <svg ref={svgRef} />
      </div>
    </div>
  );
};
export default Globe;
