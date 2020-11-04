var url = "http://127.0.0.1:5000//jsonified";

// ######## 2 Variables ########

//Function for Area vs Price Graph
function areaprice() {
  var svgWidth = 980;
  var svgHeight = 500;

  var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#areaprice")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "price";
  var chosenYAxis = "property_area";

  // function used for updating x-scale var upon click on axis label
  function xScale(csvData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
        d3.max(csvData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    return xLinearScale;
  }

  // function used for updating y-scale var upon click on axis label
  function yScale(csvData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d[chosenYAxis]) * 0.8,
        d3.max(csvData, d => d[chosenYAxis]) * 1.2
    ])
      .range([height, 0]);
    return yLinearScale;
  }

  // function used for updating xAxis var upon click on axis label
  function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
  function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }

  // function used for updating labels
  function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
    
      return textGroup;
  }

  // function used for styling tooltip values
  function styleX(value, chosenXAxis) {

    if (chosenXAxis === 'price') {
        return `${value}`;
    }
  }

  function styleY(value, chosenYAxis) {

    if (chosenYAxis === 'property_area') {
        return `${value}`;
    }
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xlabel;
    var ylabel;

    // X axis lables
    if (chosenXAxis === "price") {
      xlabel = "Price:";
    }

    // Y axis lables
    if (chosenYAxis === "property_area") {
      ylabel = "Property Area:";
    }

    // Create tooltip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(d => {
        return (`${d.address}<br>${xlabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${ylabel} ${styleY(d[chosenYAxis], chosenYAxis)}`);
      });

    circlesGroup.call(toolTip);

      // onmouseover event
    circlesGroup.on("mouseover", data => {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", (data, index) => {
        toolTip.hide(data);
      });

    return circlesGroup;
  }

  // Retrieve data and execute everything below

  d3.json(url, function(response) {
    csvData = response[0][0]
    // parse data
    csvData.forEach(data => {
      data.walk_score = +data.walk_score;
      data.property_area = +data.property_area;
      data.bike_score = +data.bike_score;
      data.price = +data.price;
      data.transit_score = +data.transit_score;
    });

    // xLinearScale and yLinearScale function above csv import
    var xLinearScale = xScale(csvData, chosenXAxis);
    var yLinearScale = yScale(csvData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(csvData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d.price))
      .attr("cy", d => yLinearScale(d.property_area))
      .attr("r", 8);
      //.attr("opacity", ".5");

    // append initial text
    var textGroup = chartGroup.selectAll('.stateText')
      .data(csvData)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .attr('dy', 3)
      .attr('font-size', '7px')
      .text(d => d.abbr);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var priceLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "price") // value to grab for event listener
      .classed("aText", true)
      .classed("active", true)
      .text("Price");


    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${0 - margin.left/4}, ${height/2})`);

    var property_areaLabel = ylabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", -20)
      .attr("value", "property_area") // value to grab for event listener
      .attr("transform", "rotate(-90)")
      .classed("aText", true)
      .classed("active", true)
      .text("Property Area");

  

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // updates x scale for new data
          xLinearScale = xScale(csvData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // updates text with new x values
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // changes classes to change bold text
          if (chosenXAxis === "price") {
            priceLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });

      // y axis labels event listener
      ylabelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;

            // updates y scale for new data
            yLinearScale = yScale(csvData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // updates text with new y values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // changes classes to change bold text
            if (chosenYAxis === "property_area") {
              property_areaLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        });
  });
}


// ######## 5 Variables ########

// Function for creating scatter plot for 5 variables
function allplot() {
  var svgWidth = 980;
  var svgHeight = 500;

  var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "walk_score";
  var chosenYAxis = "property_area";

  // function used for updating x-scale var upon click on axis label
  function xScale(csvData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
        d3.max(csvData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    return xLinearScale;
  }

  // function used for updating y-scale var upon click on axis label
  function yScale(csvData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d[chosenYAxis]) * 0.8,
        d3.max(csvData, d => d[chosenYAxis]) * 1.2
    ])
      .range([height, 0]);
    return yLinearScale;
  }

  // function used for updating xAxis var upon click on axis label
  function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
  function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }

  // function used for updating labels
  function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
    
      return textGroup;
  }

  // function used for styling tooltip values
  function styleX(value, chosenXAxis) {

    if (chosenXAxis === 'walk_score') {
        return `${value}`;
    }
    else if (chosenXAxis === 'bike_score') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
  }

  function styleY(value, chosenYAxis) {

    if (chosenYAxis === 'property_area') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xlabel;
    var ylabel;

    // X axis lables
    if (chosenXAxis === "walk_score") {
      xlabel = "Walk Score:";
    }
    else if (chosenXAxis === "bike_score") {
      xlabel = "Bike Score:";
    }
    else {
      xlabel = "Transit Score:";
    }

    // Y axis lables
    if (chosenYAxis === "property_area") {
      ylabel = "Property Area:";
    }
    else {
      ylabel = "Price:";
    }

    // Create tooltip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(d => {
        return (`${d.address}<br>${xlabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${ylabel} ${styleY(d[chosenYAxis], chosenYAxis)}`);
      });

    circlesGroup.call(toolTip);

      // onmouseover event
    circlesGroup.on("mouseover", data => {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", (data, index) => {
        toolTip.hide(data);
      });

    return circlesGroup;
  }

  // Retrieve data and execute everything below

  d3.json(url, function(response) {
    csvData = response[0][0]
    // parse data
    csvData.forEach(data => {
      data.walk_score = +data.walk_score;
      data.property_area = +data.property_area;
      data.bike_score = +data.bike_score;
      data.price = +data.price;
      data.transit_score = +data.transit_score;
    });

    // xLinearScale and yLinearScale function above csv import
    var xLinearScale = xScale(csvData, chosenXAxis);
    var yLinearScale = yScale(csvData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(csvData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.property_area))
      .attr("r", 8);
      //.attr("opacity", ".5");

    // append initial text
    var textGroup = chartGroup.selectAll('.stateText')
      .data(csvData)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .attr('dy', 3)
      .attr('font-size', '7px')
      .text(d => d.abbr);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var walk_scoreLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "walk_score") // value to grab for event listener
      .classed("aText", true)
      .classed("active", true)
      .text("Walk Score");

    var transit_scoreLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "transit_score") // value to grab for event listener
      .classed("aText", true)
      .classed("inactive", true)
      .text("Transit Score");

    var bike_scoreLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "bike_score") // value to grab for event listener
      .classed("aText", true)
      .classed("inactive", true)
      .text("Bike Score");

    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${0 - margin.left/4}, ${height/2})`);

    var property_areaLabel = ylabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", -20)
      .attr("value", "property_area") // value to grab for event listener
      .attr("transform", "rotate(-90)")
      .classed("aText", true)
      .classed("active", true)
      .text("Property Area");

    var priceLabel = ylabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", -60)
      .attr("value", "price") // value to grab for event listener
      .attr("transform", "rotate(-90)")
      .classed("aText", true)
      .classed("inactive", true)
      .text("Price");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // updates x scale for new data
          xLinearScale = xScale(csvData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // updates text with new x values
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // changes classes to change bold text
          if (chosenXAxis === "walk_score") {
            walk_scoreLabel
              .classed("active", true)
              .classed("inactive", false);
            transit_scoreLabel
              .classed("active", false)
              .classed("inactive", true);
            bike_scoreLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "transit_score") {
            walk_scoreLabel
              .classed("active", false)
              .classed("inactive", true);
            transit_scoreLabel
              .classed("active", true)
              .classed("inactive", false);
            bike_scoreLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            walk_scoreLabel
              .classed("active", false)
              .classed("inactive", true);
            transit_scoreLabel
              .classed("active", false)
              .classed("inactive", true);
            bike_scoreLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

      // y axis labels event listener
      ylabelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;

            // updates y scale for new data
            yLinearScale = yScale(csvData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // updates text with new y values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // changes classes to change bold text
            if (chosenYAxis === "property_area") {
              property_areaLabel
                .classed("active", true)
                .classed("inactive", false);
              priceLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "bed") {
              property_areaLabel
                .classed("active", false)
                .classed("inactive", true);
              priceLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              property_areaLabel
                .classed("active", false)
                .classed("inactive", true);
              priceLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        });
  });
}

// ######## Calling both the functions ########
areaprice();
allplot();