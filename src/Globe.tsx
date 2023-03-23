import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';

const Globe = () => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [rotate, setRotate] = useState<[number, number]>([0, 0])
  const svgRef = useRef<any>();
  const mapGroup = useRef<any>();
  const graticuleGroup = useRef<any>();
  const projection = useRef<any>();
  let graticule = d3.geoGraticule().step([10, 10]);

  useEffect(() => {
    fetch('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')
      .then(resp => resp.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
  }, [])

  useEffect(() => {
    if (!data) { setLoading(true) }
    else {
      let width = 400, height = 400;
      projection.current = d3.geoOrthographic().fitSize([width, height], data).rotate(rotate);
      let geoGenerator = d3.geoPath().projection(projection.current);

      mapGroup.current?.remove();
      graticuleGroup.current?.remove();

      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      svg.append('circle')
        .attr('cx', 200)
        .attr('cy', 200)
        .attr("r", 200)
        .attr('fill', 'lightBlue');


      mapGroup.current = svg
        .append('g')
        .attr('width', width)
        .attr('height', height);
        
      graticuleGroup.current = svg
        .append('g')
        .attr('width', width)
        .attr('height', height);


      mapGroup.current.selectAll('.path')
        .data(data.features)
            .join(
              (enter) => 
                enter
                  .append('path')
                  .attr('d', geoGenerator)
                  .attr('fill', '#333333'),
              (update) => 
                update
                  .transition()
                  .duration(500),
              (exit) => exit.remove()
            );
        
      graticuleGroup.current.selectAll('path-graticule')
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
          (exit) => exit.remove()
        );
    }
  }, [data, rotate])

  window.requestAnimationFrame(() => {
    setRotate((current) => [current[0] + 0.2, current[1]])
  })

  return loading ? ( 
      <h2>Loading...</h2>
    ) : (
      <>
        <svg ref={svgRef} />
      </>
    )
}

export default Globe;
