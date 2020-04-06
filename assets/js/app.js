function makeResponsive() {
    // Select our SVG Area
    var svgArea = d3.select("#scatter").select("svg");

    // If it exists, delete it (we're going to recreate it anyway)
    if (!svgArea.empty()) {
      svgArea.remove();
    }
    
    // Set our plot area
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight - 250;
    
    // Set our margins - we will need this room for our axis labels
    var margin = {
      top: 100,
      bottom: 100,
      right: svgWidth / 2,
      left: 100,
    };
    
    // Calculate our actual chart dimensions minus the margins
    var height = svgHeight - (margin.top + margin.bottom);
    var width = svgWidth - (margin.left + margin.right);
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);
    
    // Position our chart group
    var chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // xScale function
    function xScale(stateData, selectedXAxis) {
      var xLinearScale = d3
        .scaleLinear()
        .domain([
          d3.min(stateData, (d) => d[selectedXAxis]) -
            d3.max(
              stateData,
              (d) => d[selectedXAxis] - d3.min(stateData, (d) => d[selectedXAxis])
            ) /
              50,
          d3.max(stateData, (d) => d[selectedXAxis]) +
            d3.max(
              stateData,
              (d) => d[selectedXAxis] - d3.min(stateData, (d) => d[selectedXAxis])
            ) /
              50,
        ])
        .range([0, width]);
      return xLinearScale;
    }
  
    //yScale function
    function yScale(stateData, selectedYAxis) {
      var yLinearScale = d3
        .scaleLinear()
        .domain([
          d3.min(stateData, (d) => d[selectedYAxis]) -
            d3.max(
              stateData,
              (d) => d[selectedYAxis] - d3.min(stateData, (d) => d[selectedYAxis])
            ) * .1,
          d3.max(stateData, (d) => d[selectedYAxis]) +
            d3.max(
              stateData,
              (d) => d[selectedYAxis] - d3.min(stateData, (d) => d[selectedYAxis])
            ) * .1,
        ])
        .range([height, 0]);
      return yLinearScale;
    }
  
    // Transition bottom axis (X)
    function transitionXAxis(newScale, xAxis) {
      var bottomAxis = d3.axisBottom(newScale);
      xAxis.transition().duration(1000).call(bottomAxis);
  
      return xAxis;
    }
  
    // Transition left axis (Y)
    function transitionYAxis(newScale, yAxis) {
      var leftAxis = d3.axisLeft(newScale);
      yAxis.transition().duration(1000).call(leftAxis);
  
      return yAxis;
    }
  
    // Draw circles
    function drawCircles(circlesGroup, newXscale, newYscale, selectedXAxis, selectedYAxis, color) {
      circlesGroup
        .transition()
        .duration(1000)
        .attr("cx", (d) => newXscale(d[selectedXAxis]))
        .attr("cy", (d) => newYscale(d[selectedYAxis]))
        .attr("r", 12)
        .attr("fill", color);
  
      return circlesGroup;
    }
  
    function renderTextCircles(circleText, newXscale, newYscale, selectedXAxis, selectedYAxis) {
      circleText
        .transition()
        .duration(1000)
        .attr("x", (d) => newXscale(d[selectedXAxis]))
        .attr("y", (d) => newYscale(d[selectedYAxis]));
      return circleText;
    }
  
    // Set the tooltip for the circle (point)
    function updateToolTip(selectedXAxis, selectedYAxis, circlesGroup, ttip) {
      console.log(`Selected Y Axis is: '${selectedYAxis}'`);
      switch (selectedXAxis) {
        case "poverty":
          xLabel = "<strong>Poverty (%): </strong>";
          break;
        case "age":
          xLabel = "<strong>Median Age: </strong>";
          break;
        case "income":
          xLabel = "<strong>Median Household Income: $</strong>";
          break;
      }
  
      switch (selectedYAxis) {
        case "healthcare":
          yLabel = "<strong>Lacks Healthcare (%): </strong>";
          break;
        case "smokes":
          yLabel = "<strong>Smokes (%): </strong>";
          break;
        case "obesity":
          yLabel = "<strong>Obese (%): </strong>";
          break;
      }

      // Define the div for the tooltip
      var div = d3.select("body").append("div")
        .attr("class", "tooltip")				
        .style("opacity", 0);

        toolTip = d3
        .tip()
        .attr("class", `${ttip}`)
        .offset([90, -75])
        .html(function (d) {
          return `<strong>${d.state}</strong><br>--- --- --- --- --- --- ---<br>${xLabel}${d[selectedXAxis].toLocaleString()}<br>${yLabel}${d[selectedYAxis]}`;
        });
      circlesGroup.call(toolTip);

      circlesGroup
        .on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

      circleText
        .on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);
  
      return circlesGroup;
    }
  
    // get csv data then do a bunch of stuff
    d3.csv("./assets/data/data.csv").then( function(stateData) {
      console.log(stateData);
      stateData.forEach(function (d) {
        d.poverty = +d.poverty;
        d.smokes = +d.smokes;
        d.obesity = +d.obesity;
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
      });
  
      var xLinScale = xScale(stateData, selectedXAxis);
      var yLinScale = yScale(stateData, selectedYAxis);
      var bottomAxis = d3.axisBottom(xLinScale);
      var leftAxis = d3.axisLeft(yLinScale);
  
      var xAxis = chartGroup
        .append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

      var yAxis = chartGroup
        .append("g")
        .classed("healthcare-y-axis", true)
        .call(leftAxis);
  
      var circlesGroup = chartGroup
        .selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xLinScale(d[selectedXAxis]))
        .attr("cy", (d) => yLinScale(d[selectedYAxis]))
        .attr("r", 12)
        .attr("fill", "green")
        .attr("opacity", "0.7");
  
      circleText = chartGroup
        .append("g")
        .selectAll("text")
        .data(stateData)
        .enter()
        .append("text")
        .attr("class", "circle-text")
        .attr("x", (d) => xLinScale(d[selectedXAxis]))
        .attr("y", (d) => yLinScale(d[selectedYAxis]))
        .text((d) => d.abbr)
        .attr("dy", 4);
  
      var labelsGroup = chartGroup
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height + 15})`);
      
      // X Axis Labels
      var ageLabel = labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "age")
      .classed("x-active", true)
      .classed("axis-text", true)
      .text("Age (Median)");

      var povertyLabel = labelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 45)
        .attr("value", "poverty")
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Poverty Level (%)");
  
      var incomeLabel = labelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 70)
        .attr("value", "income")
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Household Income (Median)");
      
      // Y Axis Labels  
      var healthLabel = chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("value", "healthcare")
        .classed("y-active", true)
        .attr("text-anchor","middle")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("y", true)
        .classed("health-active", true)
        .text("Lacks Healthcare (%)");
  
      var smokeLabel = chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -75)
        .attr("x", -height / 2)
        .attr("value", "smokes")
        .attr("text-anchor","middle")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("y", true)
        .classed("inactive", true)
        .text("Smokes (%)");
  
      var obeseLabel = chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -100)
        .attr("x", -height / 2)
        .attr("value", "obesity")
        .attr("text-anchor","middle")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("y", true)
        .classed("inactive", true)
        .text("Obese (%)");
  
      var ttip = "healthcare-tooltip";

      // Without this line, the tooltip won't display when the page is first loaded
      // But it will work when the axis is changed
      circlesGroup = updateToolTip(
        selectedXAxis,
        selectedYAxis,
        circlesGroup,
        ttip
      );  
  
      d3.select("#scatter")
        .selectAll(".axis-text")
        .on("click", function () {
          var value = d3.select(this).attr("value");
          var xItems = ["age", "poverty", "income"];
          var yItems = ["healthcare", "smokes", "obesity"];
          
          if (yItems.includes(value)) {
            yValue = value;
            ttip = value + "-tooltip";
          }
          
          switch (yValue) {
            case "smokes":
              var color = "red";
              break;
            case "healthcare":
              var color = "green";
              break;
            case "obesity":
              var color = "blue";
              break;
          }
  
          if (xItems.includes(value)) {
            if (value !== selectedXAxis) {
              selectedXAxis = value;
  
              xLinScale = xScale(stateData, selectedXAxis);
              xAxis = transitionXAxis(xLinScale, xAxis);
              circlesGroup = drawCircles(
                circlesGroup,
                xLinScale,
                yLinScale,
                selectedXAxis,
                selectedYAxis,
                color
              );
              circleText = renderTextCircles(
                circleText,
                xLinScale,
                yLinScale,
                selectedXAxis,
                selectedYAxis
              );
              circlesGroup = updateToolTip(
                selectedXAxis,
                selectedYAxis,
                circlesGroup,
                ttip
              );
  
              switch (selectedXAxis) {
                case "age":
                  ageLabel.classed("x-active", true).classed("inactive", false);
                  povertyLabel
                    .classed("x-active", false)
                    .classed("inactive", true);
                  incomeLabel
                    .classed("x-active", false)
                    .classed("inactive", true);
                  circlesGroup = drawCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    selectedXAxis,
                    selectedYAxis,
                    color
                  );
                  break;
                case "poverty":
                  povertyLabel
                    .classed("x-active", true)
                    .classed("inactive", false);
                  ageLabel.classed("x-active", false).classed("inactive", true);
                  incomeLabel
                    .classed("x-active", false)
                    .classed("inactive", true);
                  circlesGroup = drawCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    selectedXAxis,
                    selectedYAxis,
                    color
                  );
                  break;
                case "income":
                  incomeLabel
                    .classed("x-active", true)
                    .classed("inactive", false);
                  povertyLabel
                    .classed("x-active", false)
                    .classed("inactive", true);
                  ageLabel.classed("x-active", false).classed("inactive", true);
                  circlesGroup = drawCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    selectedXAxis,
                    selectedYAxis,
                    color
                  );
                  break;
              }
            }
          }
  
          if (yItems.includes(value)) {
            if (value !== selectedYAxis) {
              selectedYAxis = value;
              yLinScale = yScale(stateData, selectedYAxis);
              yAxis = transitionYAxis(yLinScale, yAxis);
  
              circleText = renderTextCircles(
                circleText,
                xLinScale,
                yLinScale,
                selectedXAxis,
                selectedYAxis
              );
  
              switch (selectedYAxis) {
                case "smokes":
                  smokeLabel
                    .classed("smoke-active", true)
                    .classed("inactive", false);
                  healthLabel
                    .classed("health-active", false)
                    .classed("inactive", true);
                  obeseLabel
                    .classed("obese-active", false)
                    .classed("inactive", true);
                  yAxis
                    .classed("obesity-y-axis", false)
                    .classed("healthcare-y-axis", false)
                    .classed("smokes-y-axis", true);
                  circlesGroup = drawCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    selectedXAxis,
                    selectedYAxis,
                    color
                  );
                  circlesGroup = updateToolTip(
                    selectedXAxis,
                    selectedYAxis,
                    circlesGroup,
                    ttip
                  );
                  break;
                case "healthcare":
                  healthLabel
                    .classed("health-active", true)
                    .classed("inactive", false);
                  smokeLabel
                    .classed("smoke-active", false)
                    .classed("inactive", true);
                  obeseLabel
                    .classed("obese-active", false)
                    .classed("inactive", true);
                  yAxis
                    .classed("obesity-y-axis", false)
                    .classed("healthcare-y-axis", true)
                    .classed("smokes-y-axis", false);
                  circlesGroup = updateToolTip(
                    selectedXAxis,
                    selectedYAxis,
                    circlesGroup,
                    ttip
                  );
                  circlesGroup = drawCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    selectedXAxis,
                    selectedYAxis,
                    color
                  );
                  break;
                case "obesity":
                  obeseLabel
                    .classed("obese-active", true)
                    .classed("inactive", false);
                  healthLabel
                    .classed("health-active", false)
                    .classed("inactive", true);
                  smokeLabel
                    .classed("smoke-active", false)
                    .classed("inactive", true);
                  yAxis
                    .classed("obesity-y-axis", true)
                    .classed("healthcare-y-axis", false)
                    .classed("smokes-y-axis", false);
                  circlesGroup = updateToolTip(
                    selectedXAxis,
                    selectedYAxis,
                    circlesGroup,
                    ttip
                  );
                  circlesGroup = drawCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    selectedXAxis,
                    selectedYAxis,
                    color
                  );
                  break;
              }
            }
          }
        });
    });
  }  

  var xLabel;
  var yLabel;
  var tooltip;
  var circleText;
  var selectedXAxis = "age";
  var selectedYAxis = "healthcare";
  var yValue = "healthcare";
  
  makeResponsive();
  
  d3.select(window).on("resize", makeResponsive);
  d3.selectAll("circle")
    .on("mouseover", function () {
      d3.select(this).attr("stoke-width", "1px").attr("stroke", "black");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stoke-width", "0").attr("stroke", "none");
    });
  