import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const fetchSnowData = async () => {
  const response = await fetch('src/data/snowfall.json');
  const data = await response.json();
  return data;
};

const Map = () => {
  const [snowfallData, setSnowfallData] = useState();
  const svgRef = useRef<any>();

  useEffect(() => {
    fetchSnowData()
      .then((snowfall) => {
        setSnowfallData(snowfall);
      })
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    d3.json(
      'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_lakes.geojson'
    ).then(function (data: any) {
      const width = 400;
      const height = 300;
      const projection = d3.geoAlbersUsa() //.scale(1300).translate([487.5, 305]);
      projection.fitSize([width, height], data);
      const geoGenerator = d3.geoPath().projection(projection);

      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      svg.append('g').attr('width', width).attr('height', height);

      const myColor = d3
        .scaleLinear()
        .domain([0, 100])
        .range(['white', 'blue'])

      // const myColor = d3
      //   .scaleSequential()
      //   .domain([0, 100])
      //   .interpolator(d3.interpolateBuPu); 

      svg
        .append('g')
        .selectAll('path')
        .data(data.features)
        .join('path')
        .attr('d', geoGenerator)
        .attr('fill', (d: any) => {
          return snowfallData && snowfallData[d.properties.name]
            ? myColor(snowfallData[d.properties.name])
            : 'white';
        })
        .attr('stroke', '#000')
        .attr('class', 'state')
        .on('mousemove', (e) => {
          const dataPoint = d3.select(e.target).datum();
        });
    });
  }, [snowfallData]);
  return (
    <>
      <h2>Average annual snowfall</h2>
      <svg ref={svgRef} />
    </>
  );
};

export default Map;
