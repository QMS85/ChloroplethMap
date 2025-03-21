const width = 960;
const height = 600;

const svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("#tooltip");

const colorScale = d3.scaleQuantize()
    .range(["#f7fbff", "#deebf7", "#9ecae1", "#3182bd"]);

Promise.all([
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
]).then(data => {
    const counties = data[0].features;
    const educationData = data[1].data;

    const educationByFips = {};
    educationData.forEach(d => {
        educationByFips[d.fips] = d.education;
    });

    colorScale.domain(d3.extent(educationData, d => d.education));

    svg.selectAll(".county")
        .data(counties)
        .enter().append("path")
        .attr("class", "county")
        .attr("d", d3.geoPath())
        .attr("fill", d => colorScale(educationByFips[d.id]))
        .attr("data-fips", d => d.id)
        .attr("data-education", d => educationByFips[d.id])
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`County: ${d.properties.name}<br>Education: ${educationByFips[d.id]}%`)
                .attr("data-education", educationByFips[d.id])
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    createLegend();
});

function createLegend() {
    const legend = d3.select("#legend");
    const grades = colorScale.range().map(color => colorScale.invertExtent(color));
    
    grades.forEach((grade, i) => {
        legend.append("div")
            .style("background-color", colorScale(grade[0]))
            .text(`${Math.round(grade[0])} - ${Math.round(grade[1])}%`)
            .style("padding", "5px")
            .style("margin", "2px");
    });
}
