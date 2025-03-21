const width = 960, height = 600;
        const svg = d3.select("#map").attr("width", width).attr("height", height);
        const tooltip = d3.select("#tooltip");

        const educationDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
        const countyDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

        Promise.all([
            d3.json(educationDataUrl),
            d3.json(countyDataUrl)
        ]).then(data => {
            const educationData = data[0];
            const countyData = data[1];

            const colorScale = d3.scaleQuantize()
                .domain([0, d3.max(educationData, d => d.bachelorsOrHigher)])
                .range(d3.schemeBlues[5]);

            const path = d3.geoPath();
            const counties = topojson.feature(countyData, countyData.objects.counties).features;

            svg.selectAll(".county")
                .data(counties)
                .enter().append("path")
                .attr("class", "county")
                .attr("d", path)
                .attr("fill", d => {
                    const education = educationData.find(e => e.fips === d.id);
                    return education ? colorScale(education.bachelorsOrHigher) : "#ccc";
                })
                .attr("data-fips", d => d.id)
                .attr("data-education", d => {
                    const education = educationData.find(e => e.fips === d.id);
                    return education ? education.bachelorsOrHigher : 0;
                })
                .on("mouseover", (event, d) => {
                    const education = educationData.find(e => e.fips === d.id);
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(education ? `${education.area_name}, ${education.state}: ${education.bachelorsOrHigher}%` : "")
                        .attr("data-education", education ? education.bachelorsOrHigher : 0)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            const legend = d3.select("#legend");
            const legendWidth = 300;
            const legendHeight = 20;

            const legendScale = d3.scaleLinear()
                .domain([0, d3.max(educationData, d => d.bachelorsOrHigher)])
                .range([0, legendWidth]);

            const legendAxis = d3.axisBottom(legendScale)
                .ticks(5)
                .tickFormat(d => d + "%");

            legend.append("svg")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0, 0)")
                .call(legendAxis);

            const colorLegend = d3.select("#legend").append("svg")
                .attr("width", legendWidth)
                .attr("height", legendHeight);

            colorLegend.selectAll("rect")
                .data(colorScale.range())
                .enter().append("rect")
                .attr("x", (d, i) => i * (legendWidth / colorScale.range().length))
                .attr("width", legendWidth / colorScale.range().length)
                .attr("height", legendHeight)
                .attr("fill", d => d);
        });
