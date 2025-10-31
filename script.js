d3.csv("health.csv").then(health=> {
    d3.csv("ai.csv").then(aiData => {
        console.log("Health Data: ", health);  
        console.log("AI Data: ", aiData); 
        const processedData = processData(health,aiData);
        console.log("Processed Data: ", processedData);
        const chartComponents= setupChart(processedData);
        drawBubbles(processedData, chartComponents);
    });
});

function processData(health, aiData) {
    let aiMap = new Map(aiData.map(a => [a.Country.trim().toLowerCase(), a["Total score"]]));
    console.log("AI Map: ", aiMap);
    
    let mergedData = health
        .filter(h => aiMap.has(h.country.trim().toLowerCase()))
        .map(h=> ({
            country: h.country,
            life_expect: +h.life_expect,
            health_exp: +h.health_exp,
            total_score: +aiMap.get(h.country.trim().toLowerCase())            
        }));

     return mergedData;
}

function setupChart(data) {
    console.log("Data passed to setupChart: ", data); 
    const width = 1500, height = 900, margin =50;
        const svg= d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);

        const xscale = d3.scaleLinear()
        .domain([d3.min(data, d=> d.life_expect)-3, d3.max(data, d=>d.life_expect)+3])
        .range([margin, width-margin]);

        const yscale = d3.scaleLinear()
        .domain([d3.min(data, d=> d.health_exp)-1, d3.max(data, d=>d.health_exp)+3])
        .range([height- margin,margin]);

        
        const xaxis= d3.axisBottom(xscale);
        const yaxis= d3.axisLeft(yscale);

        svg.append("g")
         .attr("transform", `translate(0, ${height-margin})`)
         .call(xaxis);

         svg.append("g")
         .attr("transform", `translate(${margin},0)`)
         .call(yaxis)

         svg.append("text") 
         .attr("x", width / 2)
         .attr("y", height - 10)
         .attr("text-anchor", "middle")
         .text("Life Expectancy");
 
     svg.append("text") 
         .attr("x", -height / 2)
         .attr("y", 15)
         .attr("transform", "rotate(-90)")
         .attr("text-anchor", "middle")
         .text("Health Expenditure");

  return {svg, xscale, yscale};
}

function drawBubbles(data, { svg, xscale, yscale }) {
    console.log("Data passed to drawBubbles: ", data);

    const countryColors = {
    "Portugal": "blue",
    "Ireland": "red",
    "Denmark": "orange",
    "Germany": "yellow",
    "Canada": "purple",
    "United Kingdom": "green",
    "Sweden": "teal",
    "Chile": "coral",
    "Slovenia": "aqua",
    "Italy": "crimson",
    "Norway": "navy",
    "Iceland": "lightblue",
    "Luxembourg": "gold",
    "Estonia": "darkcyan",
    "Poland": "pink",
    "Lithuania": "olive"
};


    const defaultColor = "gray";

    const radiusScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.total_score), d3.max(data, d => d.total_score)])
        .range([15, 100]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "5px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xscale(d.life_expect))
        .attr("cy", d => yscale(d.health_exp))
        .attr("r", d => {
            const radius = radiusScale(d.total_score);
            return isNaN(radius) ? 5 : radius;
        })
        .attr("fill", d => countryColors[d.country] || defaultColor) 
        .attr("opacity", 0.6)
        .on("mouseover", function (event, d) {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`<strong>Country:</strong> ${d.country}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("stroke", "#000").attr("stroke-width", 2); 
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            tooltip.transition().duration(500).style("opacity", 0);
            d3.select(this).attr("stroke", "none");
        });

    drawLegend(svg, countryColors);
}

function drawLegend(svg, countryColors) {
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(60, 25)`); 

    const legendItemWidth = 120;
    const countries = Object.keys(countryColors);

    countries.forEach((country, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(${i * legendItemWidth}, 0)`);

        legendItem.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", countryColors[country]);

        legendItem.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(country)
            .style("font-size", "12px")
            .style("alignment-baseline", "middle");
    });
}