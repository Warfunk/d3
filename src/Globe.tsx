import { HtmlHTMLAttributes, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const resortCoordinates = {
  features: [
    { 
      geometry: {
        type: "Point",
        coordinates: [-106.3550, 39.6061]
      },
      properties: {
        resort: 'Vail',
        acres: 5317,
        averageSnowfall: 354
      },
      type: "Feature"
    },
    { 
      geometry: {
        type: "Point",
        coordinates: [-122.9486, 50.1150]
      },
      properties: {
        resort: 'Whistler Blackcomb',
        acres: 8171,
        averageSnowfall: 448
      },
      type: "Feature"
    },
    { 
      geometry: {
        type: "Point",
        coordinates: [-111.4980, 40.6461]
      },
      properties: {
        resort: 'Park City',
        acres: 7300,
        averageSnowfall: 355
      },
      type: "Feature"
    },
    { 
      geometry: {
        type: "Point",
        coordinates: [137.8619, 36.6982]
      },
      properties: {
        resort: 'Hakuba Valley',
        acres: 2372,
        averageSnowfall: 433
      },
      type: "Feature"
    },
    { 
      geometry: {
        type: "Point",
        coordinates: [148.4117, -36.4059]
      },
      properties: {
        resort: 'Perisher',
        acres: 3076,
        averageSnowfall: 78
      },
      type: "Feature"
    },
    { 
      geometry: {
        type: "Point",
        coordinates: [10.2682, 47.1296]
      },
      properties: {
        resort: 'Ski Arlberg',
        acres: 12350,
        averageSnowfall: 276
      },
      type: "Feature"
    },
    { 
      geometry: {
        type: "Point",
        coordinates: [-70.2917, -33.3403]
      },
      properties: {
        resort: 'La Parva',
        acres: 988,
        averageSnowfall: 31
      },
      type: "Feature"
    },
  ] 
};

const Tooltip = ({children, className}: HtmlHTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={className} style={{ background: 'white', position: 'absolute'}}>
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
      'src/data/countries.json'
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
      setRotate((current) => {
        const updatedX = current[0] + e.dx * k;
        const updatedY = Math.abs(current[1] - e.dy * k) > 45 ? current[1] : current[1] - e.dy * k;
        return [ updatedX, updatedY]
      });
    };

    const  drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged);

    const zoom = d3.zoom().on('zoom', (e, i) => {
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
          `<p>${i.properties.resort}</p>`
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
