// Test import of a JavaScript module
import brand_logo from '@/images/other.png';

import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "../node_modules/bootstrap/scss/bootstrap.scss";
import '@/styles/index.scss';

// Test import of external libraries
const $ = require('jquery')
const d3 = require('d3')
const loader = '<div class="spinner-border" id="loader" style="width: 3rem; height: 3rem;" role="status"> <span class="visually-hidden">Loading...</span></div>'

// Appending logo the DOM
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
    // d3.csv('/assets/clean_nodes.csv'),
    d3.csv('/assets/2023Elections_subsample_edges.csv')
]).then(([nodes, edges]) => {
    $("#tweet_interaction_colors").hide();
    $("#alt_shapley").hide()
    displayViz(nodes, edges);
    $(document).on("click", "#edit_tweet", function (event){
        d3.select("#tweet").style("display", "block");
        const tweet = $('#tweet').text();
        console.log("THE TWEET: ",tweet)
        var tweet_edit = '<label for="tweet_edit" class="form-label"></label> <textarea class="form-control" id="tweet_edit" rows="2"></textarea>';
        var submit_form = '<button type="button" class="btn btn-primary" id="counter_shapley" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">Run AI Model</button><br>';
        $("#tweet").empty();
        $("#tweet").append(tweet_edit, submit_form);
        $("#tweet_edit").val(tweet);
        $(this).remove(); 
    });

    $(document).on("click", '#counter_shapley', function(){
        var edit_button = '<button type="button" class="btn btn-primary" id="edit_tweet" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">Edit Tweet</button>';
        const tweet = $("#tweet_edit").val();
        const tweet_id = $("#tweet_id").text();
        $("#tweet").empty();
        $("#tweet").append(tweet);
        $("#interactions").after(edit_button);
        $("#alt_shapley").show();
        d3.select("#some_tweet_info").style("display", "none");
        $("#show_tweet").text("Show Tweet Info");
        // get_mock_shapley();
        const modified_tweet_id = tweet_id + crypto.randomUUID()
        get_shapley(modified_tweet_id, tweet);
        $(this).remove();
    });

    $(document).on("click", '#show_tweet', function(){
        var is_shown = $("#some_tweet_info").css("display");
        if(is_shown == "none"){
            d3.select("#some_tweet_info").style("display", "block");
            $(this).text("Hide Tweet Info");
        }
        else{
            d3.select("#some_tweet_info").style("display", "none");
            $(this).text("Show Tweet Info");
        }

    });


    $("#filter-btn").on("click", function (event){
        filterData(nodes, edges);
    });

    $(document).on("click", '#interactions', function(){
        const node_id = $("#tweet_id").text();
        console.log("NODE-ID: ",node_id);
        highlightInteractions(edges, node_id);
    });

})

//Select all the nodes and links connected to a particular node
function highlightInteractions(edges, node_id) { 
    const color_interactions = {"quote":"#12ED7A", "reply":"#ED7A12", "retweet":"#6712ED"}
    $("#tweet_interaction_colors").show();
    var filteredLinks = edges.filter(link => {
        console.log(link);
        if (link.source.id == node_id){
            d3.selectAll("circle.pt" + link.target.id)
                .attr("r", 12);
                // .attr("fill", "#7A8700");
                // .append("title", function(d) {return "Target: " + link.source.id + " : " + link.target.id; });;
            d3.selectAll("line.pt"+node_id+link.target.id)
                .attr("stroke-width", 6)
                .attr("stroke", color_interactions[link.action])
                .attr("stroke-opacity", 1);
        }
        else if(link.target.id == node_id){
            d3.selectAll("circle.pt" + link.source.id)
                .attr("r", 12);
                // .attr("fill", "#7A8700");
            d3.selectAll("line.pt"+link.source.id+node_id)
                .attr("stroke-width", 6)
                .attr("stroke", "#007A87")
                .attr("stroke-opacity", 1);
        }
    });
}


const displayViz = (nodes, edges) => {
    const width = document.getElementById('row').clientWidth;
    // const width = 1400;
    const height = 1000
    console.log("in displayViz");
    // edges = edges.slice();
    // edges = edges.filter(edge => {
    //     console.log(edge.source + " & " + edge.target)
    //     const sourceNode = nodes.find(node => node.id == edge.source);
    //     const targetNode = nodes.find(node => node.id == edge.target);
    //     // return sourceNode && targetNode;
    //     console.log(sourceNode, " & ", targetNode);
    //     if(sourceNode != undefined && targetNode != undefined){
    //         return true;
    //     }
    //     return false;
    // });
    // edges = edges.filter(edge => {
    //     console.log(edge.source + " & " + edge.target)
    //     if(edge.source != undefined && edge.target != undefined){
    //         return true;
    //     }
    //     return false;
    // });
    console.log("NODES: ", nodes)
    console.log("EDGES: ", edges)
    
    $('#num_nodes').text(nodes.length);
    $('#num_edges').text(edges.length);
    d3.select("#node-link").selectAll("*").remove();

    const svg = d3.select("#node-link")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("link", d3.forceLink(edges).id(d => d.id))
        // .distance(20).strength(0.1))
        // .force("x", d3.forceX())
        // .force("y", d3.forceY())
        // .force("center", d3.forceCenter(0, 0))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    const link = svg.append("g")
        .attr("class", "links")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(edges)
        .join("line")
        .attr("stroke", "#808080") //function(d) {return getAction(d)}
        .attr("class", function(d,i) {return "pt" + d.source.id + d.target.id; }) //give each line point a unique class in the graph
        .attr("stroke-width", 1);


    const node = svg.append("g")
        .attr("class", "nodes")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", "#870036")
        .attr("data-bs-toggle", "offcanvas")
        .attr("data-bs-target", "#offcanvasBottom")
        .attr("aria-controls", "offcanvasScrolling")
        .attr("class", function(d,i) {return "pt" + d.id; }) //give each circle point a unique class in the graph
        // .append("title").text("SOuce, target")
        .call(drag(simulation))

        .on("click", function (event, d) {
            d3.selectAll("circle").attr("r", 5).attr("fill", "#870036") //returning all circles back to regular color
            d3.selectAll("line").attr("stroke-width", 1).attr("stroke", "#808080").attr("stroke-opacity", 0.6) //returning all lines back to dafault color and width
            $("#tweet_interaction_colors").css("display", "none");

            d3.selectAll("circle.pt" + d.id).attr("r", 12).attr("fill", "red");
            d3.select("#tweet").text(d.tweet);
            d3.select("#tweet_date").text(d.timestamp.split(" ")[0]);
            d3.select("#n_quote").text(d.n_quote);
            d3.select("#n_reply").text(d.n_reply);
            d3.select("#n_retweet").text(d.n_retweet);
            d3.select("#tweet_id").text(d.id);
            get_shapley(d.id, d.tweet, '');
            // get_mock_shapley('');
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
    // invalidation.then(() => simulation.stop());
}

function filterData(nodes, edges) {
    const filteredInteraction = document.getElementById("type").value;
    const DateToFilter = document.getElementById("date").value;
    const topN = document.getElementById("top").value;
    clearTweetInfo();

    let filteredNodes = [];
    let filteredEdges = edges.slice();

    if (DateToFilter != "0") { //Gets a compounding of dates, not just one data alone
        console.log(DateToFilter);
        // for (let i=1; i <= parseInt(DateToFilter); i++){
            const filteredDate = dateRange[DateToFilter];
            const filteredDateFormatted = new Date(filteredDate+"T00:00");
            // console.log(filteredDateFormatted)
            let nodesFilter = nodes.filter(node => {
                const tweetDate = new Date(node.timestamp);
                try{
                    return tweetDate.toISOString().slice(0, 10) === filteredDateFormatted.toISOString().slice(0, 10);
                }
                catch(err){
                    return false;
                }
            });
            filteredNodes = filteredNodes.concat(nodesFilter);
            console.log("NODES SUM: ", filteredNodes);
        // }
        // for (let node_index = 0; node_index < filteredNodes.length; node_index++){
        //     filteredEdges = edges.filter(link => {
        //         if (link.source.id == filteredNodes[node_index].id || link.target.id == filteredNodes[node_index].id){
        //            return true; 
        //         }
        //         else return false;
        //     });
        // }
        
        // console.log("FILTERED NODES: ", filteredNodes);
        filteredEdges = filteredEdges.filter(edge => {
            const sourceNode = filteredNodes.find(node => node.id === edge.source.id);
            const targetNode = filteredNodes.find(node => node.id === edge.target.id);
            // return sourceNode && targetNode;
            console.log(sourceNode, " & ", targetNode);
            if(sourceNode != undefined || targetNode != undefined){
                return true;
            }
            return false;
        });
    }
    else{
        filteredNodes = nodes.slice();
        filteredEdges = edges.slice();
    }

    if (filteredInteraction) {
        filteredEdges = edges.filter(edge => edge.action === filteredInteraction);
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
            filteredNodes.find(node => node.id == edge.source.id) ||
            filteredNodes.find(node => node.id == edge.target.id)
        );
    }
    displayViz(filteredNodes, filteredEdges);
}

function clearTweetInfo() {
    d3.select("#tweet_id").text("");
    d3.select("#tweet").text("");
    d3.select("#tweet_date").text("");
    d3.select("#n_quote").text("");
    d3.select("#n_reply").text("");
    d3.select("#n_retweet").text("");
}

function get_shapley(tweet_id, tweet_text, shap="alt_") {
    emptyShap(shap);
    if (shap=="alt_") d3.select("#some_tweet_info").style("display", "none");
    $("#"+shap+"shapley").append(loader);
    const url = `http://127.0.0.1:8000/api/v1/`;
    const data = { "id": tweet_id, "tweet": tweet_text };
    const headers = { "Content-Type": "application/json" };
    fetch(url+"sentiment", { method: "POST", headers: headers, body: JSON.stringify(data) })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const sentiment = data[0];
        const neg_score = sentiment['NEGATIVE'];
        const pos_score = sentiment['POSITIVE'];

        d3.select("#"+shap+"pos_senti")
            .style("width", (pos_score*100)+'%')
            .style("background-color", "#ff0051")
            .text(pos_score.toFixed(2));
        d3.select("#"+shap+"neg_senti")
            .style("width", (neg_score*100)+'%')
            .style("background-color", "#008afa")
            .text(neg_score.toFixed(2));

    });

    fetch(url+"explanation", { method: "POST", headers: headers, body: JSON.stringify(data) })
    .then(response => response.text())
    .then(data => {
        $("#loader").remove();
        $("#"+shap+"explanation").append(data);
    });
}
function emptyShap(shap){
    $('#'+shap+'pos_senti').empty();
    $('#'+shap+'neg_senti').empty();
    $('#'+shap+'explanation').empty();

}
function get_mock_shapley(shap="alt_"){
    emptyShap(shap);
    $("#"+shap+"shapley").append(loader); //display loader while waiting for data
    if (shap=="alt_") d3.select("#some_tweet_info").style("display", "none");
    d3.select("#"+shap+"shapley").style("opacity", 1);
    let sentiment = [{id: '4567890', POSITIVE: 0.9432546439170837, NEGATIVE: 0.0677453212165273726}]
    let explanation = '\n    <br>\n    <hr style="height: 1px; background-color: #fff; border: none; margin-top: 18px; margin-bottom: 18px; border-top: 1px dashed #ccc;"">\n    <div align="center" style="margin-top: -35px;"><div style="display: inline-block; background: #fff; padding: 5px; color: #999; font-family: monospace">[0]</div>\n    </div>\n                <svg width="100%" height="80px"><line x1="0" y1="33" x2="100%" y2="33" style="stroke:rgb(150,150,150);stroke-width:1" /><line x1="52.00452685730027%" y1="33" x2="52.00452685730027%" y2="37" style="stroke:rgb(150,150,150);stroke-width:1" /><text x="52.00452685730027%" y="27" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">0.7</text><line x1="40.02416506105181%" y1="33" x2="40.02416506105181%" y2="37" style="stroke:rgb(150,150,150);stroke-width:1" /><text x="40.02416506105181%" y="27" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">0.5</text><line x1="28.043803264803344%" y1="33" x2="28.043803264803344%" y2="37" style="stroke:rgb(150,150,150);stroke-width:1" /><text x="28.043803264803344%" y="27" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">0.3</text><line x1="16.06344146855488%" y1="33" x2="16.06344146855488%" y2="37" style="stroke:rgb(150,150,150);stroke-width:1" /><text x="16.06344146855488%" y="27" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">0.1</text><line x1="63.98488865354872%" y1="33" x2="63.98488865354872%" y2="37" style="stroke:rgb(150,150,150);stroke-width:1" /><text x="63.98488865354872%" y="27" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">0.9</text><line x1="75.9652504497972%" y1="33" x2="75.9652504497972%" y2="37" style="stroke:rgb(150,150,150);stroke-width:1" /><text x="75.9652504497972%" y="27" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">1.1</text><line x1="87.94561224604564%" y1="33" x2="87.94561224604564%" y2="37" style="stroke:rgb(150,150,150);stroke-width:1" /><text x="87.94561224604564%" y="27" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">1.3</text><line x1="30.069578027010806%" y1="33" x2="30.069578027010806%" y2="37" style="stroke:rgb(150,150,150);stroke-width:1" /><text x="30.069578027010806%" y="27" font-size="13px" style="stroke:#ffffff;stroke-width:8px;" fill="rgb(255,255,255)" dominant-baseline="bottom" text-anchor="middle">0.333818</text><text x="30.069578027010806%" y="27" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">0.333818</text><text x="30.069578027010806%" y="10" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">base value</text><line x1="69.9304213739711%" y1="33" x2="69.9304213739711%" y2="37" style="stroke:rgb(150,150,150);stroke-width:1" /><text x="69.9304213739711%" y="27" font-size="13px" style="stroke:#ffffff;stroke-width:8px;" font-weight="bold" fill="rgb(255,255,255)" dominant-baseline="bottom" text-anchor="middle">0.999255</text><text x="69.9304213739711%" y="27" font-size="13px" font-weight="bold" fill="rgb(0,0,0)" dominant-baseline="bottom" text-anchor="middle">0.999255</text><text x="69.9304213739711%" y="10" font-size="12px" fill="rgb(120,120,120)" dominant-baseline="bottom" text-anchor="middle">f<tspan baseline-shift="sub" font-size="8px">POSITIVE</tspan>(inputs)</text><rect x="8.33333328341516%" width="61.59708809055594%" y="40" height="18" style="fill:rgb(255.0, 0.0, 81.08083606031792); stroke-width:0; stroke:rgb(0,0,0)" /><line x1="27.082159848905523%" x2="69.9304213739711%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_10" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2; opacity: 0"/><text x="48.50629061143831%" y="71" font-size="12px" id="_fs_ytndwaxbuhtkjldklawv_ind_10" fill="rgb(255.0, 0.0, 81.08083606031792)" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">0.715</text><svg x="27.082159848905523%" y="40" height="20" width="42.84826152506558%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">hope</text>  </svg></svg><line x1="17.97889488218902%" x2="27.082159848905523%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_7" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2; opacity: 0"/><text x="22.53052736554727%" y="71" font-size="12px" id="_fs_ytndwaxbuhtkjldklawv_ind_7" fill="rgb(255.0, 0.0, 81.08083606031792)" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">0.152</text><svg x="17.97889488218902%" y="40" height="20" width="9.103264966716502%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">but</text>  </svg></svg><line x1="11.159946949743656%" x2="17.97889488218902%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_8" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2; opacity: 0"/><text x="14.569420915966338%" y="71" font-size="12px" id="_fs_ytndwaxbuhtkjldklawv_ind_8" fill="rgb(255.0, 0.0, 81.08083606031792)" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">0.114</text><svg x="11.159946949743656%" y="40" height="20" width="6.818947932445365%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">I</text>  </svg></svg><line x1="10.161566049796509%" x2="11.159946949743656%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_6" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2; opacity: 0"/><text x="10.660756499770082%" y="71" font-size="12px" id="_fs_ytndwaxbuhtkjldklawv_ind_6" fill="rgb(255.0, 0.0, 81.08083606031792)" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">0.017</text><svg x="10.161566049796509%" y="40" height="20" width="0.9983808999471471%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">this</text>  </svg></svg><line x1="9.254990708889475%" x2="10.161566049796509%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_5" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2; opacity: 0"/><text x="9.708278379342993%" y="71" font-size="12px" id="_fs_ytndwaxbuhtkjldklawv_ind_5" fill="rgb(255.0, 0.0, 81.08083606031792)" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">0.015</text><svg x="9.254990708889475%" y="40" height="20" width="0.9065753409070343%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">country</text>  </svg></svg><line x1="8.362900863210287%" x2="9.254990708889475%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_9" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2; opacity: 0"/><text x="8.80894578604988%" y="71" font-size="12px" id="_fs_ytndwaxbuhtkjldklawv_ind_9" fill="rgb(255.0, 0.0, 81.08083606031792)" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">0.015</text><svg x="8.362900863210287%" y="40" height="20" width="0.8920898456791875%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">have</text>  </svg></svg><line x1="8.33333328341516%" x2="8.362900863210287%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_4" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2; opacity: 0"/><text x="8.348117073312723%" y="71" font-size="12px" id="_fs_ytndwaxbuhtkjldklawv_ind_4" fill="rgb(255.0, 0.0, 81.08083606031792)" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">0.0</text><svg x="8.33333328341516%" y="40" height="20" width="0.029567579795127585%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">this</text>  </svg></svg><g transform="translate(0,0)">  <svg x="27.082159848905523%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(2,0)">  <svg x="27.082159848905523%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(4,0)">  <svg x="27.082159848905523%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(6,0)">  <svg x="27.082159848905523%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-8,0)">  <svg x="27.082159848905523%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-6,0)">  <svg x="27.082159848905523%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-4,0)">  <svg x="27.082159848905523%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-2,0)">  <svg x="27.082159848905523%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(0,0)">  <svg x="17.97889488218902%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(2,0)">  <svg x="17.97889488218902%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(4,0)">  <svg x="17.97889488218902%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(6,0)">  <svg x="17.97889488218902%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-8,0)">  <svg x="17.97889488218902%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-6,0)">  <svg x="17.97889488218902%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-4,0)">  <svg x="17.97889488218902%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-2,0)">  <svg x="17.97889488218902%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(0,0)">  <svg x="11.159946949743656%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(2,0)">  <svg x="11.159946949743656%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(4,0)">  <svg x="11.159946949743656%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(6,0)">  <svg x="11.159946949743656%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-8,0)">  <svg x="11.159946949743656%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-6,0)">  <svg x="11.159946949743656%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-4,0)">  <svg x="11.159946949743656%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-2,0)">  <svg x="11.159946949743656%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(0,0)">  <svg x="10.161566049796509%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(2,0)">  <svg x="10.161566049796509%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(4,0)">  <svg x="10.161566049796509%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(6,0)">  <svg x="10.161566049796509%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-8,0)">  <svg x="10.161566049796509%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-6,0)">  <svg x="10.161566049796509%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-4,0)">  <svg x="10.161566049796509%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-2,0)">  <svg x="10.161566049796509%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(0,0)">  <svg x="9.254990708889475%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(2,0)">  <svg x="9.254990708889475%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(4,0)">  <svg x="9.254990708889475%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(6,0)">  <svg x="9.254990708889475%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-8,0)">  <svg x="9.254990708889475%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-6,0)">  <svg x="9.254990708889475%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-4,0)">  <svg x="9.254990708889475%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-2,0)">  <svg x="9.254990708889475%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(0,0)">  <svg x="8.362900863210287%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(2,0)">  <svg x="8.362900863210287%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(4,0)">  <svg x="8.362900863210287%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(6,0)">  <svg x="8.362900863210287%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-8,0)">  <svg x="8.362900863210287%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-6,0)">  <svg x="8.362900863210287%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-4,0)">  <svg x="8.362900863210287%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><g transform="translate(-2,0)">  <svg x="8.362900863210287%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255.0, 0.0, 81.08083606031792);stroke-width:2" />  </svg></g><rect transform="translate(-8,0)" x="69.9304213739711%" y="40" width="8" height="18" style="fill:rgb(255.0, 0.0, 81.08083606031792)"/><g transform="translate(-11.5,0)">  <svg x="8.33333328341516%" y="40" height="18" overflow="visible" width="30">    <path d="M 10 -9 l 6 18 L 10 25 L 0 25 L 0 -9" fill="#ffffff" style="stroke:rgb(255,255,255);stroke-width:2" />  </svg></g><g transform="translate(-1.5,0)">  <svg x="69.9304213739711%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255, 195, 213);stroke-width:2" />  </svg></g><rect x="27.082159848905523%" y="40" height="20" width="42.84826152506558%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_10\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_10\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_10\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_10\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_10\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_10\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><g transform="translate(-1.5,0)">  <svg x="27.082159848905523%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255, 195, 213);stroke-width:2" />  </svg></g><rect x="17.97889488218902%" y="40" height="20" width="9.103264966716502%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_7\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_7\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_7\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_7\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_7\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_7\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><g transform="translate(-1.5,0)">  <svg x="17.97889488218902%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255, 195, 213);stroke-width:2" />  </svg></g><rect x="11.159946949743656%" y="40" height="20" width="6.818947932445365%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_8\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_8\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_8\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_8\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_8\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_8\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><g transform="translate(-1.5,0)">  <svg x="11.159946949743656%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255, 195, 213);stroke-width:2" />  </svg></g><rect x="10.161566049796509%" y="40" height="20" width="0.9983808999471471%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_6\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_6\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_6\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_6\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_6\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_6\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><g transform="translate(-1.5,0)">  <svg x="10.161566049796509%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255, 195, 213);stroke-width:2" />  </svg></g><rect x="9.254990708889475%" y="40" height="20" width="0.9065753409070343%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_5\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_5\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_5\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_5\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_5\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_5\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><g transform="translate(-1.5,0)">  <svg x="9.254990708889475%" y="40" height="18" overflow="visible" width="30">    <path d="M 0 -9 l 6 18 L 0 25" fill="none" style="stroke:rgb(255, 195, 213);stroke-width:2" />  </svg></g><rect x="8.362900863210287%" y="40" height="20" width="0.8920898456791875%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_9\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_9\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_9\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_9\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_9\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_9\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><rect x="8.33333328341516%" y="40" height="20" width="0.029567579795127585%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_4\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_4\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_4\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_4\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_4\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_4\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><rect x="69.9304213739711%" width="21.736244743595645%" y="40" height="18" style="fill:rgb(0.0, 138.56128015770724, 250.76166088685727); stroke-width:0; stroke:rgb(0,0,0)" /><line x1="69.9304213739711%" x2="86.483925626713%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_2" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2; opacity: 0"/><text x="78.20717350034205%" y="71" font-size="12px" fill="rgb(0.0, 138.56128015770724, 250.76166088685727)" id="_fs_ytndwaxbuhtkjldklawv_ind_2" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">-0.276</text><svg x="69.9304213739711%" y="40" height="20" width="16.553504252741902%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">hate</text>  </svg></svg><line x1="86.483925626713%" x2="89.00881660898689%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_3" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2; opacity: 0"/><text x="87.74637111784995%" y="71" font-size="12px" fill="rgb(0.0, 138.56128015770724, 250.76166088685727)" id="_fs_ytndwaxbuhtkjldklawv_ind_3" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">-0.042</text><svg x="86.483925626713%" y="40" height="20" width="2.524890982273888%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">how</text>  </svg></svg><line x1="89.00881660898689%" x2="90.81428276202061%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_11" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2; opacity: 0"/><text x="89.91154968550376%" y="71" font-size="12px" fill="rgb(0.0, 138.56128015770724, 250.76166088685727)" id="_fs_ytndwaxbuhtkjldklawv_ind_11" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">-0.03</text><svg x="89.00881660898689%" y="40" height="20" width="1.80546615303372%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">.</text>  </svg></svg><line x1="90.81428276202061%" x2="91.66666611756675%" y1="60" y2="60" id="_fb_ytndwaxbuhtkjldklawv_ind_1" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2; opacity: 0"/><text x="91.24047443979367%" y="71" font-size="12px" fill="rgb(0.0, 138.56128015770724, 250.76166088685727)" id="_fs_ytndwaxbuhtkjldklawv_ind_1" style="opacity: 0" dominant-baseline="middle" text-anchor="middle">-0.014</text><svg x="90.81428276202061%" y="40" height="20" width="0.852383355546138%">  <svg x="0" y="0" width="100%" height="100%">    <text x="50%" y="9" font-size="12px" fill="rgb(255,255,255)" dominant-baseline="middle" text-anchor="middle">I</text>  </svg></svg><g transform="translate(-8,0)">  <svg x="86.483925626713%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-10,0)">  <svg x="86.483925626713%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-12,0)">  <svg x="86.483925626713%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-14,0)">  <svg x="86.483925626713%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(2,0)">  <svg x="86.483925626713%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(0,0)">  <svg x="86.483925626713%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-2,0)">  <svg x="86.483925626713%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-4,0)">  <svg x="86.483925626713%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-8,0)">  <svg x="89.00881660898689%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-10,0)">  <svg x="89.00881660898689%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-12,0)">  <svg x="89.00881660898689%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-14,0)">  <svg x="89.00881660898689%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(2,0)">  <svg x="89.00881660898689%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(0,0)">  <svg x="89.00881660898689%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-2,0)">  <svg x="89.00881660898689%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-4,0)">  <svg x="89.00881660898689%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-8,0)">  <svg x="90.81428276202061%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-10,0)">  <svg x="90.81428276202061%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-12,0)">  <svg x="90.81428276202061%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-14,0)">  <svg x="90.81428276202061%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(2,0)">  <svg x="90.81428276202061%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(0,0)">  <svg x="90.81428276202061%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-2,0)">  <svg x="90.81428276202061%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><g transform="translate(-4,0)">  <svg x="90.81428276202061%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(0.0, 138.56128015770724, 250.76166088685727);stroke-width:2" />  </svg></g><rect transform="translate(0,0)" x="69.9304213739711%" y="40" width="8" height="18" style="fill:rgb(0.0, 138.56128015770724, 250.76166088685727)"/><g transform="translate(-6.0,0)">  <svg x="91.66666611756675%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25 L 20 25 L 20 -9" fill="#ffffff" style="stroke:rgb(255,255,255);stroke-width:2" />  </svg></g><g transform="translate(-6.0,0)">  <svg x="86.483925626713%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(208, 230, 250);stroke-width:2" />  </svg></g><rect x="69.9304213739711%" y="40" height="20" width="16.553504252741902%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_2\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_2\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_2\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_2\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_2\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_2\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><g transform="translate(-6.0,0)">  <svg x="89.00881660898689%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(208, 230, 250);stroke-width:2" />  </svg></g><rect x="86.483925626713%" y="40" height="20" width="2.524890982273888%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_3\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_3\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_3\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_3\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_3\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_3\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><g transform="translate(-6.0,0)">  <svg x="90.81428276202061%" y="40" height="18" overflow="visible" width="30">    <path d="M 8 -9 l -6 18 L 8 25" fill="none" style="stroke:rgb(208, 230, 250);stroke-width:2" />  </svg></g><rect x="89.00881660898689%" y="40" height="20" width="1.80546615303372%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_11\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_11\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_11\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_11\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_11\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_11\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /><rect x="90.81428276202061%" y="40" height="20" width="0.852383355546138%"      onmouseover="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_1\').style.textDecoration = \'underline\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_1\').style.opacity = 1;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_1\').style.opacity = 1;"      onmouseout="document.getElementById(\'_tp_ytndwaxbuhtkjldklawv_ind_1\').style.textDecoration = \'none\';document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_1\').style.opacity = 0;document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_1\').style.opacity = 0;" style="fill:rgb(0,0,0,0)" /></svg><div align=\'center\'><div style="color: rgb(120,120,120); font-size: 12px; margin-top: -15px;">inputs</div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>0.0</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_0\'\n            style=\'display: inline; background: rgba(230.2941176470614, 26.505882352939775, 102.59215686274348, 0.0); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_0\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_0\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_0\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_0\').style.opacity = 0;"\n        ></div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>-0.014</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_1\'\n            style=\'display: inline; background: rgba(30.0, 136.0, 229.0, 0.014656367597544028); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_1\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_1\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_1\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_1\').style.opacity = 0;"\n        >I </div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>-0.276</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_2\'\n            style=\'display: inline; background: rgba(30.0, 136.0, 229.0, 0.3851455733808674); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_2\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_2\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_2\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_2\').style.opacity = 0;"\n        >hate </div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>-0.042</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_3\'\n            style=\'display: inline; background: rgba(30.0, 136.0, 229.0, 0.05407011289364222); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_3\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_3\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_3\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_3\').style.opacity = 0;"\n        >how </div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>0.0</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_4\'\n            style=\'display: inline; background: rgba(230.2941176470614, 26.505882352939775, 102.59215686274348, 0.0); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_4\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_4\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_4\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_4\').style.opacity = 0;"\n        >this </div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>0.015</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_5\'\n            style=\'display: inline; background: rgba(255.0, 13.0, 87.0, 0.014656367597544035); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_5\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_5\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_5\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_5\').style.opacity = 0;"\n        >country </div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>0.017</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_6\'\n            style=\'display: inline; background: rgba(255.0, 13.0, 87.0, 0.014656367597544035); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_6\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_6\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_6\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_6\').style.opacity = 0;"\n        >this </div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>0.152</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_7\'\n            style=\'display: inline; background: rgba(255.0, 13.0, 87.0, 0.2117250940780353); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_7\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_7\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_7\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_7\').style.opacity = 0;"\n        >but </div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>0.114</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_8\'\n            style=\'display: inline; background: rgba(255.0, 13.0, 87.0, 0.15654585066349747); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_8\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_8\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_8\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_8\').style.opacity = 0;"\n        >I </div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>0.015</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_9\'\n            style=\'display: inline; background: rgba(255.0, 13.0, 87.0, 0.014656367597544035); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_9\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_9\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_9\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_9\').style.opacity = 0;"\n        >have </div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>0.715</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_10\'\n            style=\'display: inline; background: rgba(255.0, 13.0, 87.0, 1.0); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_10\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_10\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_10\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_10\').style.opacity = 0;"\n        >hope</div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>-0.03</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_11\'\n            style=\'display: inline; background: rgba(30.0, 136.0, 229.0, 0.03830461477520309); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_11\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_11\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_11\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_11\').style.opacity = 0;"\n        >.</div></div><div style=\'display: inline; text-align: center;\'\n    ><div style=\'display: none; color: #999; padding-top: 0px; font-size: 12px;\'>0.0</div\n        ><div id=\'_tp_ytndwaxbuhtkjldklawv_ind_12\'\n            style=\'display: inline; background: rgba(230.2941176470614, 26.505882352939775, 102.59215686274348, 0.0); border-radius: 3px; padding: 0px\'\n            onclick="\n            if (this.previousSibling.style.display == \'none\') {\n                this.previousSibling.style.display = \'block\';\n                this.parentNode.style.display = \'inline-block\';\n            } else {\n                this.previousSibling.style.display = \'none\';\n                this.parentNode.style.display = \'inline\';\n            }"\n            onmouseover="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_12\').style.opacity = 1; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_12\').style.opacity = 1;"\n            onmouseout="document.getElementById(\'_fb_ytndwaxbuhtkjldklawv_ind_12\').style.opacity = 0; document.getElementById(\'_fs_ytndwaxbuhtkjldklawv_ind_12\').style.opacity = 0;"\n        ></div></div></div>'
    const pos_score = Object.values(sentiment[0])[1];
    const neg_score = Object.values(sentiment[0])[2];
    console.log("POSITIVE: ",pos_score);
    $("#loader").remove(); //remove loader before displaying Shapley Explanation
    d3.select("#"+shap+"pos_senti")
        .style("width", (pos_score*100)+'%')
        .style("background-color", "#008afa")
        .text(pos_score.toFixed(2));
    d3.select("#"+shap+"neg_senti")
        .style("width", (neg_score*100)+'%')
        .style("background-color", "#ff0051")
        .text(neg_score.toFixed(2));

    // d3.select("#sentiment1").text(Object.keys(sentiment[0])[1]);
    // d3.select("#sentiment2").text(Object.keys(sentiment[0])[2]);
    // d3.select("#score1").text(Object.values(sentiment[0])[1]);
    // d3.select("#score2").text(Object.values(sentiment[0])[2]);

    $("#"+shap+"explanation").append(explanation);
}