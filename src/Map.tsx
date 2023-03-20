import { useEffect, useRef } from "react";
import * as d3 from 'd3';
import * as topojson from 'topojson';

const Map = () => {
    const svgRef = useRef<any>();

    useEffect(() => {
        d3.json('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson').then(function(data: any) {
            let width = 400, height = 400;
            let projection = d3.geoAlbersUsa();
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
        
            svg.append('g').selectAll('path')
                .data(data.features)
                .join('path')
                .attr('d', geoGenerator)
                .attr('fill', (d: any) => {
                    console.log('D', d)
                    return d.properties.name === 'Colorado' ? '#FF0000' :  '#088'})
                .attr('stroke', '#000');
        });
    }, [])
    return (
        <>
          <svg ref={svgRef} />
        </>
      );
}

export default Map;
