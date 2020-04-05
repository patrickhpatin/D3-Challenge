function makeResponsive() {
    var svgArea = d3.select("#scatter").select("svg");
  
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight - 128;
  
    var margin = {
      top: 100,
      bottom: 100,
      right: svgWidth / 2,
      left: 125,
    };
  
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);
  
    var chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // xScale function
    function xScale(stateData, chosenXaxis) {
      var xlinear = d3
        .scaleLinear()
        .domain([
          d3.min(stateData, (d) => d[chosenXaxis]) -
            d3.max(
              stateData,
              (d) => d[chosenXaxis] - d3.min(stateData, (d) => d[chosenXaxis])
            ) /
              50,
          d3.max(stateData, (d) => d[chosenXaxis]) +
            d3.max(
              stateData,
              (d) => d[chosenXaxis] - d3.min(stateData, (d) => d[chosenXaxis])
            ) /
              50,
        ])
        .range([0, width]);
      return xlinear;
    }
  
    //yScale function
    function yScale(stateData, chosenYaxis) {
      var ylinear = d3
        .scaleLinear()
        .domain([
          d3.min(stateData, (d) => d[chosenYaxis]) -
            d3.max(
              stateData,
              (d) => d[chosenYaxis] - d3.min(stateData, (d) => d[chosenYaxis])
            ) /
              10,
          d3.max(stateData, (d) => d[chosenYaxis]) +
            d3.max(
              stateData,
              (d) => d[chosenYaxis] - d3.min(stateData, (d) => d[chosenYaxis])
            ) /
              10,
        ])
        .range([height, 0]);
      return ylinear;
    }
  
    // renderbottomaxis function
    function renderXAxis(newXscale, xAxis) {
      var bottomaxis = d3.axisBottom(newXscale);
      xAxis.transition().duration(1000).call(bottomaxis);
  
      return xAxis;
    }
  
    //redner left axis funtion
    function renderYAxis(newYscale, yAxis) {
      var leftAxis = d3.axisLeft(newYscale);
      yAxis.transition().duration(1000).call(leftAxis);
  
      return yAxis;
    }
  
    //render circles function
    function renderCircles(
      circlesGroup,
      newXscale,
      newYscale,
      chosenXAxis,
      chosenYaxis,
      color
    ) {
      circlesGroup
        .transition()
        .duration(1000)
        .attr("cx", (d) => newXscale(d[chosenXAxis]))
        .attr("cy", (d) => newYscale(d[chosenYaxis]))
        .attr("r", 15)
        .attr("fill", color);
  
      return circlesGroup;
    }
  
    function renderTextCircles(
      circleText,
      newXscale,
      newYscale,
      chosenXaxis,
      chosenYaxis
    ) {
      circleText
        .transition()
        .duration(1000)
        .attr("x", (d) => newXscale(d[chosenXaxis]))
        .attr("y", (d) => newYscale(d[chosenYaxis]));
      return circleText;
    }
  
    //updatetooltip funciton
    function updateToolTip(chosenXAxis, chosenYaxis, circlesGroup, ttip) {
      switch (chosenXAxis) {
        case "poverty":
          xlabel = "<strong>Poverty (%): </strong>";
          break;
        case "age":
          xlabel = "<strong>Age (Median): </strong>";
          break;
        case "income":
          xlabel = "<strong>HH Income (Median): $</strong>";
          break;
      }
  
      switch (chosenYaxis) {
        case "healthcare":
          ylabel = "<strong>No Healthcare (%): </strong>";
          break;
        case "smokes":
          ylabel = "<strong>Smokes (%): </strong>";
          break;
        case "obesity":
          ylabel = "<strong>Obese (%): </strong>";
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
          return `<strong>${d.state}</strong><br>--- --- --- --- --- --- ---<br>${xlabel}${d[chosenXAxis].toLocaleString()}<br>${ylabel}${d[chosenYaxis]}`;
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
  
    // get csv data then execute stuff below
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
  
      var chosenXAxis = "age";
      var chosenYaxis = "obesity";
      var xLinScale = xScale(stateData, chosenXAxis);
      var yLinScale = yScale(stateData, chosenYaxis);
      var bottomAxis = d3.axisBottom(xLinScale);
      var leftAxis = d3.axisLeft(yLinScale);
  
      var xAxis = chartGroup
        .append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

      var yAxis = chartGroup
        .append("g")
        .classed("obesity-y-axis", true)
        .call(leftAxis);
  
      var circlesGroup = chartGroup
        .selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xLinScale(d[chosenXAxis]))
        .attr("cy", (d) => yLinScale(d[chosenYaxis]))
        .attr("r", 15)
        .attr("fill", "blue")
        .attr("opacity", "0.7");
  
      circleText = chartGroup
        .append("g")
        .selectAll("text")
        .data(stateData)
        .enter()
        .append("text")
        .attr("class", "circle-text")
        .attr("x", (d) => xLinScale(d[chosenXAxis]))
        .attr("y", (d) => yLinScale(d[chosenYaxis]))
        .text((d) => d.abbr)
        .attr("dy", 4);
  
      var labelsGroup = chartGroup
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
      
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
        .attr("x", -width / 2)
        .attr("value", "healthcare")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("y", true)
        .classed("health-active", true)
        .text("Lacks Healthcare (%)");
  
      var smokeLabel = chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -75)
        .attr("x", -width / 2)
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("y", true)
        .classed("inactive", true)
        .text("Smokes (%)");
  
      var obeseLabel = chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -100)
        .attr("x", -width / 2)
        .attr("value", "obesity")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("y", true)
        .classed("inactive", true)
        .text("Obese (%)");
  
      var ttip = "obesity-tooltip";
      var circlesGroup = updateToolTip(
        chosenXAxis,
        chosenYaxis,
        circlesGroup,
        ttip
      );
  
      var yvalue = "obesity";
  
      d3.select("#scatter")
        .selectAll(".axis-text")
        .on("click", function () {
          var value = d3.select(this).attr("value");
          var xitems = ["age", "poverty", "income"];
          var yitems = ["healthcare", "smokes", "obesity"];
  
          if (yitems.includes(value)) {
            yvalue = value;
            ttip = value + "-tooltip";
          }
  
          switch (yvalue) {
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
  
          if (xitems.includes(value)) {
            if (value !== chosenXAxis) {
              chosenXAxis = value;
  
              xLinScale = xScale(stateData, chosenXAxis);
              xAxis = renderXAxis(xLinScale, xAxis);
              circlesGroup = renderCircles(
                circlesGroup,
                xLinScale,
                yLinScale,
                chosenXAxis,
                chosenYaxis,
                color
              );
              circleText = renderTextCircles(
                circleText,
                xLinScale,
                yLinScale,
                chosenXAxis,
                chosenYaxis
              );
              circlesGroup = updateToolTip(
                chosenXAxis,
                chosenYaxis,
                circlesGroup,
                ttip
              );
  
              switch (chosenXAxis) {
                case "age":
                  ageLabel.classed("x-active", true).classed("inactive", false);
                  povertyLabel
                    .classed("x-active", false)
                    .classed("inactive", true);
                  incomeLabel
                    .classed("x-active", false)
                    .classed("inactive", true);
                  circlesGroup = renderCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    chosenXAxis,
                    chosenYaxis,
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
                  circlesGroup = renderCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    chosenXAxis,
                    chosenYaxis,
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
                  circlesGroup = renderCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    chosenXAxis,
                    chosenYaxis,
                    color
                  );
                  break;
              }
            }
          }
  
          if (yitems.includes(value)) {
            if (value !== chosenYaxis) {
              chosenYaxis = value;
              yLinScale = yScale(stateData, chosenYaxis);
              yAxis = renderYAxis(yLinScale, yAxis);
  
              circleText = renderTextCircles(
                circleText,
                xLinScale,
                yLinScale,
                chosenXAxis,
                chosenYaxis
              );
  
              switch (chosenYaxis) {
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
                  circlesGroup = renderCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    chosenXAxis,
                    chosenYaxis,
                    color
                  );
                  circlesGroup = updateToolTip(
                    chosenXAxis,
                    chosenYaxis,
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
                    chosenXAxis,
                    chosenYaxis,
                    circlesGroup,
                    ttip
                  );
                  circlesGroup = renderCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    chosenXAxis,
                    chosenYaxis,
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
                    chosenXAxis,
                    chosenYaxis,
                    circlesGroup,
                    ttip
                  );
                  circlesGroup = renderCircles(
                    circlesGroup,
                    xLinScale,
                    yLinScale,
                    chosenXAxis,
                    chosenYaxis,
                    color
                  );
                  break;
              }
            }
          }
        });
    });
  }  

  var xlabel;
  var ylabel;
  var tooltip;
  var circleText;
  makeResponsive();
  
  d3.select(window).on("resize", makeResponsive);
  d3.selectAll("circle")
    .on("mouseover", function () {
      d3.select(this).attr("stoke-width", "1px").attr("stroke", "black");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stoke-width", "0").attr("stroke", "none");
    });
  