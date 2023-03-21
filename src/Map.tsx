import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';

const fetchSnowData = async () => {
    const response = await fetch('src/data/snowfall.json');
    const data = await response.json();
    return data;
}

const Map = () => {
    const [snowfallData, setSnowfallData] = useState();
    const svgRef = useRef<any>();

    useEffect(() => {
        fetchSnowData().then((snowfall) => {
            setSnowfallData(snowfall)
        }).catch((e) => console.log(e));
    }, [])

    useEffect(() => {
        d3.json('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_lakes.geojson').then(function(data: any) {
            let width = 400, height = 400;
            let projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
            projection.fitSize([width, height], data);
            let geoGenerator = d3.geoPath()
                .projection(projection);

            const svg = d3
                .select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
        
            svg
                .append('g')
                .style("width", width)
                .style("height", height)

            const myColor = d3.scaleSequential().domain([0, 100]).interpolator(d3.interpolateBuPu);
        
            svg.append('g').selectAll('path')
                .data(data.features)
                .join('path')
                .attr('d', geoGenerator)
                .attr('fill', (d: any) => {
                    console.log('D', d)
                    return snowfallData && snowfallData[d.properties.name] 
                      ? myColor(snowfallData[d.properties.name]) 
                      : 'white' })
                .attr('stroke', '#000');
        });
    }, [snowfallData])
    return (
        <>
          <svg ref={svgRef} />
        </>
      );
}

export default Map;
