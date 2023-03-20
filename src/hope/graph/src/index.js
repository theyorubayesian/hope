// Test import of a JavaScript module
import { example } from '@/js/example'

// Test import of an asset
import webpackLogo from '@/images/webpack-logo.svg'

// Test import of styles
import '@/styles/index.scss'

// Test import of external libraries
const $ = require('jquery')
const d3 = require('d3')

// Appending to the DOM
const logo = $('<img />', {src: webpackLogo})

const heading = $('<h1 />', {html: example()})

// Test a background image url in CSS
const imageBackground = $('<div />', {class: 'image'})

// Test a public folder asset
const imagePublic = $('<img />', {src: '/assets/example.png'})

// const svgs = $('<div />', {class: 'svgcontainer'})

// Add all to root
const app = $('#root')
// app.append("svg")
// app.append(logo, heading, imageBackground, imagePublic)

function getInteractions(d) {
    return d.n_retweet + d.n_reply + d.n_quote
}

// nodes = 
// d3.csv('/assets/income_evaluation.csv', function(d) {
//     // convert to numerical values
//     d.age = +d.age
//     d.fnlwgt = +d.fnlwgt
//     d.education_num = +d.education_num
//     d.capital_gain = +d.capital_gain
//     d.capital_loss = +d.capital_loss
//     d.hours_per_week = +d.hours_per_week

//     return d
// }).then(function(data) {
    // Your d3 drawing code comes here
    // The below example draws a simple "scatterplot"
    // console.log(data)

// const w = 400, h = 400

const width = window.innerWidth
const height = window.innerHeight

var nodes = await d3.csv('/assets/2023Elections_sample_nodes.csv')
   .then(function(node){ return node; });

var edges = await d3.csv('/assets/2023Elections_sample_edges.csv')
   .then(function(edge){ return edge; });

// let nodeElements

var radius = d3.scaleSqrt([1, 1e5], [0, width / 24]).clamp(true)

var svg = d3.select('#root').append('svg')
svg.attr('id', 'graph')
   .attr('width', width)
   .attr('height', height)

// d3.queue()
// .defer(d3.csv, "/assets/2023Elections_sample_nodes.csv")
// .defer(d3.csv, "/assets/2023Elections_sample_edges.csv")
// .await(function (error, node_list, edge_list) {
//     console.log("Here");
//     createForceLayout(node_list, edge_list);
// });


// function createForceDirectedGraph(nodes, edges) {
//     var body = d3.select('body');
//     const svg = body.append("svg")

var simulation = d3.forceSimulation(nodes)
	.force('charge', d3.forceManyBody().strength(-20))
	.force('center', d3.forceCenter(width / 2, height / 2))
	.on('tick', ticked);

const node = svg.append("g")
   .selectAll("circle")
   .data(nodes)
   .join("circle")
   .attr("r", 5)
   .attr('fill', 'white');

const linkElements = svg.append('g')
   .attr('stroke-width', 1)
   .attr('stroke', 'white')
   .selectAll('line')
   .data(edges)
   .join('line');

function ticked() {
   linkElements
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

   node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
   }


// const nodeElements = svg.append('g').selectAll("circle")
//    .data(nodes, d => d.id)
//    .enter()
//    .append("circle")
//    // .attr("class", "node")
//    .attr('r', 5)  // d => radius(getInteractions(d))
//    .attr('fill', 'white')

// simulation.force('link', d3.forceLink().strength(edge => 1))


// linkElements
//    .attr('x1', link => link.source.x)
//    .attr('y1', link => link.source.y)
//    .attr('x2', link => link.target.x)
//    .attr('y2', link => link.target.y)

//  simulation.force('link').link(edges)
// var svg = d3.select("#svgcontainer")
//  .append("svg")
// var body = d3.select('body');
// const svg = body.append("svg")

// svg.attr('id', 'graph')
//     .attr('width', width)
//     .attr('height', height)

// const nodeElements = svg.selectAll("circle.node")
//     .data(nodes)
//     .enter()
//         .append("circle")
//         .attr("class", "node")
//         .attr('r', 100)  // d => radius(getInteractions(d))
//         .attr('fill', 'white')

// const simulation = d3.forceSimulation()
//     .force('charge', d3.forceManyBody().strength(-20)) 
//     .force('center', d3.forceCenter(width / 2, height / 2))

// simulation.nodes(nodes).on("tick", () => {
//     nodeElements
//         .attr("cx", node => node.x)
//         .attr("cy", node => node.y)
// })

// var mySVG = (new XMLSerializer()).serializeToString(svg.node());
// console.log(mySVG)
// console.log(nodes)
    // console.log(nodes);
   
    // svg.selectAll('.dot')
    //     .data(data)
    //     .enter()
    //     .append('circle')
    //     .attr('class', 'dot')
    //     .attr('cx', function(d) {
    //         return d.education_num / 18.0 * w;
    //     })
    //     .attr('cy', function(d) {
    //         return d.hours_per_week / 100.0 * h
    //     })
    //     .attr('r', 3)
// }) 

// function createForceLayout(nodes,edges) {
//     console.log("Hello")
//     // var nodeHash = {};
//     // for (x in nodes) {
//     //   nodeHash[nodes[x].id] = nodes[x];
//     // };
//     // for (x in edges) {
//     //   edges[x].weight = parseInt(edges[x].weight);
//     //   edges[x].source = nodeHash[edges[x].source];
//     //   edges[x].target = nodeHash[edges[x].target];
//     // };

//     var body = d3.select('body');
// //     const svg = body.append("svg")

//    var weightScale = d3.scale.linear()
//       .domain(d3.extent(edges, 1))
//       .range([.1,1]);

//    var force = d3.layout.force().charge(-1000)	
//       .size([500,500])
//       .nodes(nodes)
//       .links(edges)
//       .on("tick", forceTick);

//  d3.select("svg").selectAll("line.link")
//     .data(edges, function (d) {return d.source + "-" + d.target;})	
//     .enter()
//     .append("line")
//     .attr("class", "link")
//     .style("stroke", "black")
//     .style("opacity", .5)
//     // .style("stroke-width", function(d) {return d.weight});

//  var nodeEnter = d3.select("svg").selectAll("g.node")
//     .data(nodes, function (d) {return d.id})
//     .enter()
//     .append("g")
//     .attr("class", "node");
//  nodeEnter.append("circle")
//     .attr("r", 5)
//     .style("fill", "lightgray")
//     .style("stroke", "black")
//     .style("stroke-width", "1px");
//  nodeEnter.append("text")
//     .style("text-anchor", "middle")
//     .attr("y", 15)
//     .text(function(d) {return d.id;});
//  force.start();	
 
//  function forceTick() {
//    d3.selectAll("line.link")
//       .attr("x1", function (d) {return d.source.x;})	
//       .attr("x2", function (d) {return d.target.x;})
//       .attr("y1", function (d) {return d.source.y;})
//       .attr("y2", function (d) {return d.target.y;});
//    d3.selectAll("g.node")
//       .attr("transform", function (d) {
//           return "translate("+d.x+","+d.y+")";
//       })
//  };
// };