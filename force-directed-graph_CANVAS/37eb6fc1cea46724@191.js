import define1 from "./7a9e12f9fb3d8e06@459.js";
import define2 from "./a33468b95d0b15b0@808.js";

function _1(md){return(
md``
)}

function _chart(ForceGraph,miserables,width,invalidation){return(
ForceGraph(miserables, {
  nodeId: (d) => d.id,
  nodeGroup: (d) => d.group,
  linkStrokeWidth: (l) => Math.sqrt(l.value),  
  width,
  height: 600,
  invalidation, // a promise to stop the simulation when the cell is re-run
})
)}

function _3(howto){return(
howto("ForceGraph")
)}

function _ForceGraph(d3,DOM){return(
function ForceGraph({
  nodes, // an iterable of node objects (typically [{id}, …])
  links // an iterable of link objects (typically [{source, target}, …])
}, {
  nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
  nodeGroup, // given d in nodes, returns an (ordinal) value for color
  nodeGroups, // an array of ordinal values representing the node groups
  nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
  nodeStroke = "#fff", // node stroke color
  nodeStrokeWidth = 1.5, // node stroke width, in pixels
  nodeStrokeOpacity = 1, // node stroke opacity
  nodeRadius = 5, // node radius, in pixels
  nodeStrength,
  linkSource = ({source}) => source, // given d in links, returns a node identifier string
  linkTarget = ({target}) => target, // given d in links, returns a node identifier string
  linkStroke = "#999", // link stroke color
  linkStrokeOpacity = 0.6, // link stroke opacity
  linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
  linkStrokeLinecap = "round", // link stroke linecap
  linkStrength,
  colors = d3.schemeTableau10, // an array of color strings, for the node groups
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  invalidation // when this promise resolves, stop the simulation,
} = {}) {
  // Compute values.
  const N = d3.map(nodes, nodeId).map(intern);
  const LS = d3.map(links, linkSource).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
  const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
  const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (_, i) => ({id: N[i]}));
  links = d3.map(links, (_, i) => ({source: LS[i], target: LT[i]}));

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

  // Construct the forces.
  const forceNode = d3.forceManyBody();
  const forceLink = d3.forceLink(links).id(({index: i}) => N[i]);
  if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
  if (linkStrength !== undefined) forceLink.strength(linkStrength);

  const simulation = d3.forceSimulation(nodes)
    .force("link", forceLink)
    .force("charge", forceNode)
    .force("center",  d3.forceCenter(width/2, height/2))
    .on("tick", ticked);

  const context = DOM.context2d(width, height);

  function ticked() {
    context.clearRect(0, 0, width, height);

    context.save();
    context.globalAlpha = linkStrokeOpacity;
    for (const [i, link] of links.entries()) { 
      context.beginPath();        
      drawLink(link);
      context.strokeStyle = L ? L[i]: linkStroke;
      context.lineWidth = W ? W[i]: linkStrokeWidth;
      context.stroke();
    }
    context.restore();

    context.save();
    context.strokeStyle = nodeStroke;
    context.globalAlpha = nodeStrokeOpacity;
    for (const [i, node] of nodes.entries()) {
      context.beginPath();
      drawNode(node) 
      context.fillStyle = G ? color(G[i]): nodeFill;
      context.strokeStyle = nodeStroke;
      context.fill();
      context.stroke();
    }
    context.restore();
  }

  function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
  }

  function drawNode(d) {
    context.moveTo(d.x + nodeRadius, d.y);
    context.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI);
  }  

  if (invalidation != null) invalidation.then(() => simulation.stop());

  function intern(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }

  function drag(simulation) {    
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    function dragsubject(event) {
      return simulation.find(event.sourceEvent.offsetX, event.sourceEvent.offsetY);
    }
    
    return d3.drag()
      .subject(dragsubject)
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  return Object.assign(d3.select(context.canvas).call(drag(simulation)).node(), {scales: {color}});
}
)}

function _miserables(FileAttachment){return(
FileAttachment("miserables.json").json()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["miserables.json", {url: new URL("./miserables.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["ForceGraph","miserables","width","invalidation"], _chart);
  main.variable(observer()).define(["howto"], _3);
  main.variable(observer("ForceGraph")).define("ForceGraph", ["d3","DOM"], _ForceGraph);
  main.variable(observer("miserables")).define("miserables", ["FileAttachment"], _miserables);
  const child1 = runtime.module(define1);
  main.import("howto", child1);
  const child2 = runtime.module(define2);
  main.import("Swatches", child2);
  return main;
}
