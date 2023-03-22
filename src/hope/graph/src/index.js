// Test import of a JavaScript module
import { example } from '@/js/example'

// Test import of an asset
import webpackLogo from '@/images/webpack-logo.svg'

// Test import of styles
// import '@/styles/index.scss'

// Test import of external libraries
const $ = require('jquery')
const d3 = require('d3')

// // Appending to the DOM
// const logo = $('<img />', { src: webpackLogo })

// const heading = $('<h1 />', { html: example() })

// // Test a background image url in CSS
// const imageBackground = $('<div />', { class: 'image' })

// Test a public folder asset
// const imagePublic = $('<img />', { src: '/assets/example.png' })

// const svgs = $('<div />', {class: 'svgcontainer'})

// Add all to root
// const app = $('#root')
// app.append("svg")
// app.append(logo, heading, imageBackground, imagePublic)

const app = $('#root')
let graphViz = ''

Promise.all([
    d3.csv('/assets/2023Elections_sample_nodes.csv'),
    d3.csv('/assets/2023Elections_sample_edges.csv')
]).then(([nodes, edges]) => {
    displayViz(nodes, edges)
})

const displayViz = (nodes, edges) => {
    const width = 1000;
    const height = 500;

    console.log(nodes)
    console.log(edges)

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
        .attr("fill", "red")
        .call(drag(simulation));

    node.on("click", function (event, d) {
        d3.select("#tweet").text(d.tweet);
        d3.select("#tweet_date").text(d.timestamp.split(" ")[0]);
        d3.select("#n_quote").text(d.n_quote);
        d3.select("#n_reply").text(d.n_reply);
        d3.select("#n_retweet").text(d.n_retweet);
    });

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

filterData = () => {
    const filteredInteraction = document.getElementById("type").value;
    const filteredDate = document.getElementById("date").value;
    const topN = document.getElementById("top").value;

    clearTweetInfo();

    let filteredNodes = nodes.slice();
    let filteredEdges = edges.slice();

    if (filteredDate) {
        const filteredDateFormatted = new Date(filteredDate);
        filteredNodes = nodes.filter(node => {
            const tweetDate = new Date(node.timestamp);
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
        if (filteredInteraction)
            filteredNodes = filteredNodes.sort((a, b) => b[`n_${filteredInteraction}`] - a[`n_${filteredInteraction}`]).slice(0, topN);
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

const filterButton = document.getElementById("filter-btn");
filterButton.addEventListener('change', filterData);

clearTweetInfo = () => {
    d3.select("#tweet").text("");
    d3.select("#tweet_date").text("");
    d3.select("#n_quote").text("");
    d3.select("#n_reply").text("");
    d3.select("#n_retweet").text("");
}