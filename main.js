const root = document.getElementById('root');

const URL_COUNTIES = 'https://raw.githubusercontent.com/VizualAT/map-standup/main/counties.json';
const URL_USER_STORIES = 'https://raw.githubusercontent.com/VizualAT/map-standup/main/user_stories.json';
 
const urlArray = [d3.json(URL_COUNTIES), d3.json(URL_USER_STORIES)];
Promise.all(urlArray).then(result => buildGraph(result));

const buildGraph = data => {
    const us = data[0];
    const userstories = data[1];    

    const margin = {top: 75, right: 20, bottom: 75, left: 20}
    const width = 1000 - margin.right - margin.left;
    const height = 700 - margin.top - margin.bottom;
    const svg = d3.select('#map')
                    .append('svg')
                    .attr('width', width + margin.right + margin.left)
                    .attr('height', height + margin.top + margin.bottom);
    const path = d3.geoPath();
    
    // Legend
     const maxEd = d3.max(userstories, d => d.story_point);
     const minEd = d3.min(userstories, d => d.story_point);
 
     const legendWidth = 300
     const legendScale = d3.scaleLinear()
                             .domain([minEd, maxEd])
                             .range([0,legendWidth]);    
  
     const colorScale = d3.scaleSequential()
                         .domain(legendScale.domain())
                         .interpolator(d3.interpolateBlues);

    // tooltip
    const tooltip = d3.select('body')
                        .append('div')
                        .style('position', 'absolute')
                        .style('opacity', '0')
                        .text('filler text')
                        .attr('id', 'tooltip');
    
    // Counties
    svg.append('g').selectAll('path')
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append('path')
        .attr('class', 'county')
        .attr('data-fips', (d) => d.id)
        .style('fill', d => colorScale(userstories.find(fips => fips.fips === d.id ).story_point ))        
        .on('mouseover', (d) => {
            let stories = userstories.find(fips => fips.fips === d.id && (fips.state === 'FL' || fips.state === 'CO'));
            tooltip.style('opacity', 0.8)
                    .attr('data-education', stories.story_point)
                    .style('z-index', 10)
                    .html(`${stories.area_name}  - ${stories.story_point} story points`)
                    .style('top', d3.event.pageY + 'px')
                    .style('left', (d3.event.pageX + 10) + 'px')
                })
        .on('mouseout', () => tooltip.style('opacity', 0).style('z-index', '-1'))
        .attr('d', path);


}

