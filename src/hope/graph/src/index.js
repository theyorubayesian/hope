// Test import of a JavaScript module
import { example } from '@/js/example'

import brand_logo from '@/images/other.png'
// Test import of styles
// import '@/styles/index.scss'

// Test import of external libraries
const $ = require('jquery')
const d3 = require('d3')

// Appending to the DOM
const logo = $('<img />', { src: brand_logo, alt: 'HOPE23', width: '45', height: '40'})

const heading = "<b> HOPE '23</b>"
var navbar = $('#logo')

navbar.append(logo, heading)

var slider = document.getElementById("date");
var output = document.getElementById("dateVal");

const dateRange = {"0":"No Date Selected", "1":"2023-02-18", "2":"2023-02-19", "3":"2023-02-20", "4":"2023-02-21", "5":"2023-02-22", "6":"2023-02-23", "7":"2023-02-24", "8":"2023-02-25", "9":"2023-02-26", "10":"2023-02-27", "11":"2023-02-28"}
slider.oninput = function() {
    output.innerHTML = dateRange[this.value];
}

Promise.all([
    d3.csv('/assets/2023Elections_subsample_nodes.csv'),
    d3.csv('/assets/2023Elections_subsample_edges.csv')
]).then(([nodes, edges]) => {
    displayViz(nodes, edges)
    document.getElementById('filter-btn').onclick = function() {
        filterData(nodes, edges);
    };
})

// // Appending to the DOM
// //Appending Data plots to the DOM
// const node_data_read = d3.csv('/assets/2023Elections_subsample_nodes.csv');
// const edge_data_read = d3.csv('/assets/2023Elections_subsample_edges.csv');

// const nodes = node_data_read.then(function(node) {
//     const edges = edge_data_read.then(function(edge) {
//         displayViz(node, edge)
//         document.getElementById('filter-btn').onclick = function() {
//             filterData(node, edge);
//         };
//         return edge;
//         });
//     return node;    
// });


const displayViz = (nodes, edges) => {
    const width = document.getElementById('row').clientWidth;
    const height = 1000

    console.log("NODES: ", nodes)
    console.log("EDGES: ", edges)

    d3.select("#node-link").selectAll("*").remove();

    const svg = d3.select("#node-link")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("link", d3.forceLink(edges).id(d => d.id))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    const link = svg.append("g")
        .attr("class", "links")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(edges)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
        .attr("class", "nodes")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", "#5142BD")
        .attr("data-bs-toggle", "offcanvas")
        .attr("data-bs-target", "#offcanvasBottom")
        .attr("aria-controls", "offcanvasScrolling")
        .attr("class", function(d,i) {return "pt" + d.id; }) //give each circle point a unique class in the graph
        .call(drag(simulation))

        .on("click", function (event, d) {
            d3.selectAll("circle").attr("r", 5).attr("fill", "#5142BD") //returning all circles back to regular color
            d3.selectAll("circle.pt" + d.id).attr("r", 12).attr("fill", "red");
            d3.select("#tweet").text(d.tweet);
            d3.select("#tweet_date").text(d.timestamp.split(" ")[0]);
            d3.select("#n_quote").text(d.n_quote);
            d3.select("#n_reply").text(d.n_reply);
            d3.select("#n_retweet").text(d.n_retweet);
        })

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function drag(simulation) {

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            event.subject.fx = event.subject.x
            event.subject.fy = event.subject.y
        }

        function dragged(event) {
            event.subject.fx = event.x
            event.subject.fy = event.y
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0)
            event.subject.fx = null
            event.subject.fy = null
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    }
}

function filterData(nodes, edges) {
    const filteredInteraction = document.getElementById("type").value;
    const DateToFilter = document.getElementById("date").value;
    const filteredDate = dateRange[DateToFilter] ;
    const topN = document.getElementById("top").value;
    clearTweetInfo();

    let filteredNodes = nodes.slice();
    let filteredEdges = edges.slice();

    if (DateToFilter != "0") {
        const filteredDateFormatted = new Date(filteredDate+"T00:00");
        console.log(filteredDateFormatted)
        filteredNodes = nodes.filter(node => {
            const tweetDate = new Date(node.timestamp);
            console.log("TWEET DATE: ", node.timestamp)
            return tweetDate.toISOString().slice(0, 10) === filteredDateFormatted.toISOString().slice(0, 10);
        });
        filteredEdges = filteredEdges.filter(edge => {
            const sourceNode = filteredNodes.find(node => node.id === edge.source.id);
            const targetNode = filteredNodes.find(node => node.id === edge.target.id);
            return sourceNode && targetNode;
        });
    }

    if (filteredInteraction) {
        filteredEdges = edges.filter(edge => edge.type === filteredInteraction);
        const filteredNodeIds = new Set(filteredEdges.flatMap(edge => [edge.source.id, edge.target.id]));
        filteredNodes = nodes.filter(node => filteredNodeIds.has(node.id));
    }

    if (topN) {
        if (filteredInteraction){
            filteredNodes = filteredNodes.sort((a, b) => b[`n_${filteredInteraction}`] - a[`n_${filteredInteraction}`]).slice(0, topN);
        }
        else {
            const sumInteractions = node => node.n_retweet + node.n_reply + node.n_quote;
            filteredNodes = filteredNodes.sort((a, b) => sumInteractions(b) - sumInteractions(a)).slice(0, topN);
        }
        filteredEdges = filteredEdges.filter(edge =>
            filteredNodes.find(node => node.id === edge.source.id) &&
            filteredNodes.find(node => node.id === edge.target.id)
        );
    }
    displayViz(filteredNodes, filteredEdges);
}

function clearTweetInfo() {
    d3.select("#tweet").text("");
    d3.select("#tweet_date").text("");
    d3.select("#n_quote").text("");
    d3.select("#n_reply").text("");
    d3.select("#n_retweet").text("");
}