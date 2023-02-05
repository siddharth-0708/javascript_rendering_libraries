// https://observablehq.com/@zakjan/force-directed-graph-pixi@1959
import define1 from "./e93997d5089d7165@2303.js";
import define2 from "./02b5d13e0cab86ac@69.js";
import define3 from "./7da2adbc1e532da9@39.js";
import define4 from "./8eabfd5bcf898b2a@30.js";
import define5 from "./bc766ef1e1e9415c@304.js";

function _1(md){return(
md``
)}

function _config(inputsForm,select,graphs,formatInt,layouts,checkbox){return(
inputsForm([
  {
    name: 'graph',
    element: select({
      options: Object.entries(graphs).map(([name, graph]) => ({ value: name, label: `${name} (nodes: ${formatInt(graph.nodes.length)}, links: ${formatInt(graph.links.length)})`})),
      value: 'Les Misérables', 
      title: '',
    }),
  },
  {
    name: 'multiply',
    element: select({
      options: [1, 2, 3, 4, 5, 6, 7, 8],
      value: 1,
      title: '',
      description: '',
    }),
  },
  {
    name: 'hyper',
    element: select({
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      value: 0,
      title: '',
      description: '',
    }),
  },
  {
    name: 'layout',
    element: select({
      options: layouts,
      value: layouts[0],
      title: '',
    }),
  },
  {
    name: 'showFpsMeter',
    element: checkbox({
      options: [{ value: 'true', label: 'Show FPS meter' }],
    }),
  },
])
)}

function _3(md,formatInt,graph){return(
md``
)}

async function* _chart(width,height,html,runLayout,graph,config,PIXI,FontFaceObserver,Viewport,uniq,colorToNumber,color,invalidation,formatInt,fpsMeter,getLayoutReadability,formatFloat)
{
  // config
  const SCREEN_WIDTH = width;
  const SCREEN_HEIGHT = height;
  const RESOLUTION = window.devicePixelRatio;
  const NODE_RADIUS = 15;
  const NODE_BORDER_WIDTH = 2;
  const NODE_BORDER_COLOR = 0xffffff;
  const NODE_BORDER_RADIUS = NODE_RADIUS + NODE_BORDER_WIDTH;
  const NODE_HIT_WIDTH = 5;
  const NODE_HIT_RADIUS = NODE_RADIUS + NODE_HIT_WIDTH;
  const NODE_HOVER_BORDER_COLOR = 0x000000;
  const ICON_FONT_FAMILY = 'Material Icons';
  const ICON_FONT_SIZE = NODE_RADIUS / Math.SQRT2 * 2;
  const ICON_COLOR = 0xffffff;
  const ICON_TEXT = nodeData => typeof nodeData.id === 'number' || typeof nodeData.id === 'string' && (!isNaN(parseInt(nodeData.id[0], 10)) || nodeData.id[0] === '(') ? 'star' : 'person';
  const LABEL_FONT_FAMILY = 'HelveticaRegular';
  const LABEL_FONT_SIZE = 12;
  const LABEL_COLOR = 0x333333;
  const LABEL_TEXT = nodeData => `${nodeData.id}`;
  const LABEL_PADDING = 4;
  const LABEL_BACKGROUND_COLOR = 0xffffff;
  const LABEL_BACKGROUND_ALPHA = 0.5;
  const LABEL_HOVER_BACKGROUND_COLOR = 0xeeeeee;
  const LABEL_HOVER_BACKGROUND_ALPHA = 1;
  const LINK_SIZE = linkData => Math.log((linkData.value || 1) + 1);
  const LINK_COLOR = 0xcccccc;
  const LINK_HOVER_COLOR = 0x999999;
  
  const TEXTURE_COLOR = 0xffffff;
  
  const CIRCLE = 'CIRCLE';
  const CIRCLE_BORDER = 'CIRCLE_BORDER';
  const ICON = 'ICON';
  const LABEL = 'LABEL';
  const LABEL_BACKGROUND = 'LABEL_BACKGROUND';
  const LINE = 'LINE';

  // compute static layout
  yield html`<div style="height: ${SCREEN_HEIGHT}px; font-size: 0.85rem">Computing layout...</div>`;
  const { positions, layoutTime } = await runLayout(graph, config.layout);
  const { nodes, links } = graph;
  nodes.forEach(nodeData => {
    const position = positions[nodeData.id];
    nodeData.x = position.x;
    nodeData.y = position.y;
  });
  
  // normalize node positions
  yield html`<div style="height: ${SCREEN_HEIGHT}px; font-size: 0.85rem">Rendering...</div>`;
  const minNodeX = Math.min(...nodes.map(nodeData => nodeData.x));
  const maxNodeX = Math.max(...nodes.map(nodeData => nodeData.x));
  const minNodeY = Math.min(...nodes.map(nodeData => nodeData.y));
  const maxNodeY = Math.max(...nodes.map(nodeData => nodeData.y));
  const graphWidth = Math.abs(maxNodeX - minNodeX);
  const graphHeight = Math.abs(maxNodeY - minNodeY);
  const WORLD_WIDTH = Math.max(SCREEN_WIDTH * 2, graphWidth * 1.1);
  const WORLD_HEIGHT = Math.max(SCREEN_HEIGHT * 2, graphHeight * 1.1);
  nodes.forEach(nodeData => {
    nodeData.x = nodeData.x - minNodeX - graphWidth / 2 + WORLD_WIDTH / 2;
    nodeData.y = nodeData.y - minNodeY - graphHeight / 2 + WORLD_HEIGHT / 2;
  });

  // create PIXI application
  console.log(SCREEN_WIDTH, SCREEN_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT, RESOLUTION);
  const app = new PIXI.Application({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resolution: RESOLUTION,
    transparent: true,
    antialias: true,
    autoDensity: true,
    autoStart: false // disable automatic rendering by ticker, render manually instead, only when needed
  });
  app.view.style.width = `${SCREEN_WIDTH}px`;
  
  // preload fonts
  await new Promise(resolve => {
    app.loader.add(LABEL_FONT_FAMILY, 'https://gist.githubusercontent.com/zakjan/b61c0a26d297edf0c09a066712680f37/raw/8cdda3c21ba3668c3dd022efac6d7f740c9f1e18/HelveticaRegular.fnt').load(resolve);
  });
  await new FontFaceObserver(ICON_FONT_FAMILY).load();
  
  // manual rendering
  // app.renderer.on('postrender', () => { console.log('render'); });
  let renderRequestId = undefined;
  const requestRender = () => {
    if (renderRequestId) {
      return;
    }
    renderRequestId = window.requestAnimationFrame(() => {
      app.render();
      renderRequestId = undefined;
    });
  }
  
  // create PIXI viewport
  const viewport = new Viewport({
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    interaction: app.renderer.plugins.interaction
  });
  const zoomIn = () => {
    viewport.zoom(-WORLD_WIDTH / 10, true);
  };
  const zoomOut = () => {
    viewport.zoom(WORLD_WIDTH / 10, true);
  };
  const resetViewport = () => {
    viewport.center = new PIXI.Point(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    viewport.fitWorld(true);
  };
  app.stage.addChild(viewport);
  viewport.drag().pinch().wheel().decelerate().clampZoom({ minWidth: SCREEN_WIDTH, minHeight: SCREEN_HEIGHT });
  
  // create layers: links, front links, nodes, labels, front nodes, front labels
  const linksLayer = new PIXI.Container();
  viewport.addChild(linksLayer);
  const frontLinksLayer = new PIXI.Container();
  viewport.addChild(frontLinksLayer);
  const nodesLayer = new PIXI.Container();
  viewport.addChild(nodesLayer);
  const labelsLayer = new PIXI.Container();
  viewport.addChild(labelsLayer);
  const frontNodesLayer = new PIXI.Container();
  viewport.addChild(frontNodesLayer);
  const frontLabelsLayer = new PIXI.Container();
  viewport.addChild(frontLabelsLayer);
  
  // create textures: circle, circle border, icons
  const circleGraphics = new PIXI.Graphics();
  circleGraphics.beginFill(TEXTURE_COLOR);
  circleGraphics.drawCircle(NODE_RADIUS, NODE_RADIUS, NODE_RADIUS);
  const circleTexture = app.renderer.generateTexture(circleGraphics, PIXI.settings.SCALE_MODE, RESOLUTION);
  
  const circleBorderGraphics = new PIXI.Graphics();
  circleBorderGraphics.lineStyle(NODE_BORDER_WIDTH, TEXTURE_COLOR);
  circleBorderGraphics.drawCircle(NODE_BORDER_RADIUS, NODE_BORDER_RADIUS, NODE_RADIUS);
  const circleBorderTexture = app.renderer.generateTexture(circleBorderGraphics, PIXI.settings.SCALE_MODE, RESOLUTION);
  
  const iconTextures = new Map(uniq(nodes.map(nodeData => ICON_TEXT(nodeData))).map(icon => {
    const iconText = new PIXI.Text(icon, {
      fontFamily: ICON_FONT_FAMILY,
      fontSize: ICON_FONT_SIZE,
      fill: TEXTURE_COLOR
    });
    iconText.visible = false;
    const iconTexture = app.renderer.generateTexture(iconText, PIXI.settings.SCALE_MODE, RESOLUTION);
    return [icon, iconTexture];
  }));

  // state
  let nodeDataToNodeGfx = new WeakMap();
  let nodeGfxToNodeData = new WeakMap();
  let nodeDataToLabelGfx = new WeakMap();
  let labelGfxToNodeData = new WeakMap();
  let linkDataToLinkGfx = new WeakMap();
  let linkGfxToLinkData = new WeakMap();
  let hoveredNodeData = undefined;
  let clickedNodeData = undefined;
  let hoveredLinkData = undefined;
  
  const updatePositions = () => {
    nodes.forEach(nodeData => {
      const nodeGfx = nodeDataToNodeGfx.get(nodeData);
      const labelGfx = nodeDataToLabelGfx.get(nodeData);
      
      nodeGfx.x = nodeData.x;
      nodeGfx.y = nodeData.y;
      labelGfx.x = nodeData.x;
      labelGfx.y = nodeData.y;
    });
    
    links.forEach(linkData => {
      const sourceNodeData = nodes.find(nodeData => nodeData.id === linkData.source);
      const targetNodeData = nodes.find(nodeData => nodeData.id === linkData.target);
      
      const linkGfx = linkDataToLinkGfx.get(linkData);
      const line = linkGfx.getChildByName(LINE);
      
      const lineLength = Math.max(Math.sqrt((targetNodeData.x - sourceNodeData.x) ** 2 + (targetNodeData.y - sourceNodeData.y) ** 2) - NODE_BORDER_RADIUS * 2, 0);
      
      linkGfx.x = sourceNodeData.x;
      linkGfx.y = sourceNodeData.y;
      linkGfx.rotation = Math.atan2(targetNodeData.y - sourceNodeData.y, targetNodeData.x - sourceNodeData.x);
      line.width = lineLength;
    });
    
    requestRender();
  };
  
  const round = value => Math.round(value * 1000) / 1000;
  const updateVisibility = () => {
    // culling
    const cull = new PIXI.Cull();
    cull.addAll(nodesLayer.children);
    cull.addAll(labelsLayer.children);
    cull.addAll(linksLayer.children);
    cull.cull(app.renderer.screen);
    // console.log(
    //   [...cull._targetList].filter(x => x.visible === true).length,
    //   [...cull._targetList].filter(x => x.visible === false).length
    // );
    
    // levels of detail
    const zoom = viewport.scale.x;
    const zoomSteps = [0.1, 0.2, 0.4, Infinity];
    const zoomStep = zoomSteps.findIndex(zoomStep => zoom <= zoomStep);
    
    nodes.forEach(nodeData => {
      const nodeGfx = nodeDataToNodeGfx.get(nodeData);
      const circleBorder = nodeGfx.getChildByName(CIRCLE_BORDER);
      const icon = nodeGfx.getChildByName(ICON);
      const labelGfx = nodeDataToLabelGfx.get(nodeData);
      const label = labelGfx.getChildByName(LABEL);
      const labelBackground = labelGfx.getChildByName(LABEL_BACKGROUND);
      
      circleBorder.visible = zoomStep >= 1;
      icon.visible = zoomStep >= 2;
      label.visible = zoomStep >= 3;
      labelBackground.visible = zoomStep >= 3;
    });
    
    links.forEach(linkData => {
      const linkGfx = linkDataToLinkGfx.get(linkData);
      const line = linkGfx.getChildByName(LINE);
      
      line.visible = zoomStep >= 1;
    });
  };
  
  // event handlers
  const hoverNode = nodeData => {
    if (clickedNodeData) {
      return;
    }
    if (hoveredNodeData === nodeData) {
      return;
    }
    
    hoveredNodeData = nodeData;
    
    const nodeGfx = nodeDataToNodeGfx.get(nodeData);
    const labelGfx = nodeDataToLabelGfx.get(nodeData);

    // move to front layer
    nodesLayer.removeChild(nodeGfx);
    frontNodesLayer.addChild(nodeGfx);
    labelsLayer.removeChild(labelGfx);
    frontLabelsLayer.addChild(labelGfx);
    
    // add hover effect
    const circleBorder = nodeGfx.getChildByName(CIRCLE_BORDER);
    circleBorder.tint = NODE_HOVER_BORDER_COLOR;

    const labelBackground = labelGfx.getChildByName(LABEL_BACKGROUND);
    labelBackground.tint = LABEL_HOVER_BACKGROUND_COLOR;
    labelBackground.alpha = LABEL_HOVER_BACKGROUND_ALPHA;
    
    requestRender();
  };
  const unhoverNode = nodeData => {
    if (clickedNodeData) {
      return;
    }
    if (hoveredNodeData !== nodeData) {
      return;
    }
    
    hoveredNodeData = undefined;
    
    const nodeGfx = nodeDataToNodeGfx.get(nodeData);
    const labelGfx = nodeDataToLabelGfx.get(nodeData);
    
    // move back from front layer
    frontNodesLayer.removeChild(nodeGfx);
    nodesLayer.addChildAt(nodeGfx, nodes.indexOf(nodeData));
    frontLabelsLayer.removeChild(labelGfx);
    labelsLayer.addChildAt(labelGfx, nodes.indexOf(nodeData));

    // clear hover effect
    const circleBorder = nodeGfx.getChildByName(CIRCLE_BORDER);
    circleBorder.tint = NODE_BORDER_COLOR;
    
    const labelBackground = labelGfx.getChildByName(LABEL_BACKGROUND);
    labelBackground.tint = LABEL_BACKGROUND_COLOR;
    labelBackground.alpha = LABEL_BACKGROUND_ALPHA;
    
    requestRender();
  };
  const hoverLink = linkData => {
    if (hoveredLinkData === linkData) {
      return;
    }
    
    hoveredLinkData = linkData;
    
    const linkGfx = linkDataToLinkGfx.get(linkData);

    // move to front layer
    linksLayer.removeChild(linkGfx);
    frontLinksLayer.addChild(linkGfx);
    
    // add hover effect
    const line = linkGfx.getChildByName(LINE);
    line.tint = LINK_HOVER_COLOR;
    
    requestRender();
  };
  const unhoverLink = linkData => {
    if (hoveredLinkData !== linkData) {
      return;
    }
    
    hoveredLinkData = undefined;
    
    const linkGfx = linkDataToLinkGfx.get(linkData);
    
    // move back from front layer
    frontLinksLayer.removeChild(linkGfx);
    linksLayer.addChildAt(linkGfx, links.indexOf(linkData));

    // clear hover effect
    const line = linkGfx.getChildByName(LINE);
    line.tint = LINK_COLOR;
    
    requestRender();
  };
  const moveNode = (nodeData, point) => {
    const nodeGfx = nodeDataToNodeGfx.get(nodeData);
    
    nodeData.x = point.x;
    nodeData.y = point.y;
    
    updatePositions();
  };
  const appMouseMove = event => {
    if (!clickedNodeData) {
      return;
    }
    
    moveNode(clickedNodeData, viewport.toWorld(event.data.global));
  };
  const clickNode = nodeData => {
    clickedNodeData = nodeData;
    
    // enable node dragging
    app.renderer.plugins.interaction.on('mousemove', appMouseMove);
    // disable viewport dragging
    viewport.pause = true;
  };
  const unclickNode = () => {
    clickedNodeData = undefined;
    
    // disable node dragging
    app.renderer.plugins.interaction.off('mousemove', appMouseMove);
    // enable viewport dragging
    viewport.pause = false;
  };
  
  // create node graphics
  const nodeDataGfxPairs = nodes.map(nodeData => {
    const nodeGfx = new PIXI.Container();
    nodeGfx.x = nodeData.x;
    nodeGfx.y = nodeData.y;
    nodeGfx.interactive = true;
    nodeGfx.buttonMode = true;
    nodeGfx.hitArea = new PIXI.Circle(0, 0, NODE_HIT_RADIUS);
    nodeGfx.on('mouseover', event => hoverNode(nodeGfxToNodeData.get(event.currentTarget)));
    nodeGfx.on('mouseout', event => unhoverNode(nodeGfxToNodeData.get(event.currentTarget)));
    nodeGfx.on('mousedown', event => clickNode(nodeGfxToNodeData.get(event.currentTarget)));
    nodeGfx.on('mouseup', () => unclickNode());
    nodeGfx.on('mouseupoutside', () => unclickNode());
    
    const circle = new PIXI.Sprite(circleTexture);
    circle.name = CIRCLE;
    circle.x = -circle.width / 2;
    circle.y = -circle.height / 2;
    circle.tint = colorToNumber(color(nodeData));
    nodeGfx.addChild(circle);

    const circleBorder = new PIXI.Sprite(circleBorderTexture);
    circleBorder.name = CIRCLE_BORDER;
    circleBorder.x = -circleBorder.width / 2;
    circleBorder.y = -circleBorder.height / 2;
    circleBorder.tint = NODE_BORDER_COLOR;
    nodeGfx.addChild(circleBorder);

    const icon = new PIXI.Sprite(iconTextures.get(ICON_TEXT(nodeData)));
    icon.name = ICON;
    icon.x = -icon.width / 2;
    icon.y = -icon.height / 2;
    icon.tint = ICON_COLOR;
    nodeGfx.addChild(icon);
    
    const labelGfx = new PIXI.Container();
    labelGfx.x = nodeData.x;
    labelGfx.y = nodeData.y;
    labelGfx.interactive = true;
    labelGfx.buttonMode = true;
    labelGfx.on('mouseover', event => hoverNode(labelGfxToNodeData.get(event.currentTarget)));
    labelGfx.on('mouseout', event => unhoverNode(labelGfxToNodeData.get(event.currentTarget)));
    labelGfx.on('mousedown', event => clickNode(labelGfxToNodeData.get(event.currentTarget)));
    labelGfx.on('mouseup', () => unclickNode());
    labelGfx.on('mouseupoutside', () => unclickNode());
    
    const label = new PIXI.BitmapText(LABEL_TEXT(nodeData), {
      font: {
        name: LABEL_FONT_FAMILY,
        size: LABEL_FONT_SIZE
      },
      align: 'center',
      tint: LABEL_COLOR
    });
    label.name = LABEL;
    label.x = -label.width / 2;
    label.y = NODE_HIT_RADIUS + LABEL_PADDING;
    label.alpha = 0;
    label.visible = false;
    const labelBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
    labelBackground.name = LABEL_BACKGROUND;
    labelBackground.x = -(label.width + LABEL_PADDING * 2) / 2;
    labelBackground.y = NODE_HIT_RADIUS;
    labelBackground.width = label.width + LABEL_PADDING * 2;
    labelBackground.height = label.height + LABEL_PADDING * 2;
    labelBackground.tint = LABEL_BACKGROUND_COLOR;
    labelBackground.alpha = LABEL_BACKGROUND_ALPHA;
    //labelGfx.addChild(labelBackground);
    //labelGfx.addChild(label);
    
    nodesLayer.addChild(nodeGfx);
    labelsLayer.addChild(labelGfx);

    return [nodeData, nodeGfx, labelGfx];
  });
  
  // create link graphics
  const linkDataGfxPairs = links.map(linkData => {
    const sourceNodeData = nodes.find(nodeData => nodeData.id === linkData.source);
    const targetNodeData = nodes.find(nodeData => nodeData.id === linkData.target);
    
    const lineLength = Math.max(Math.sqrt((targetNodeData.x - sourceNodeData.x) ** 2 + (targetNodeData.y - sourceNodeData.y) ** 2) - NODE_BORDER_RADIUS * 2, 0);
    const lineSize = LINK_SIZE(linkData);
    
    const linkGfx = new PIXI.Container();
    linkGfx.x = sourceNodeData.x;
    linkGfx.y = sourceNodeData.y;
    linkGfx.pivot.set(0, lineSize / 2);
    linkGfx.rotation = Math.atan2(targetNodeData.y - sourceNodeData.y, targetNodeData.x - sourceNodeData.x);
    linkGfx.interactive = true;
    linkGfx.buttonMode = true;
    linkGfx.on('mouseover', event => hoverLink(linkGfxToLinkData.get(event.currentTarget)));
    linkGfx.on('mouseout', event => unhoverLink(linkGfxToLinkData.get(event.currentTarget)));
    
    const line = new PIXI.Sprite(PIXI.Texture.WHITE);
    line.name = LINE;
    line.x = NODE_BORDER_RADIUS;
    line.y = -lineSize / 2;
    line.width = lineLength;
    line.height = lineSize;
    line.tint = LINK_COLOR;
    linkGfx.addChild(line);
    
    linksLayer.addChild(linkGfx);
    
    return [linkData, linkGfx];
  });
  
  // create lookup tables
  nodeDataToNodeGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, nodeGfx]));
  nodeGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeGfx, nodeData]));
  nodeDataToLabelGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, labelGfx]));
  labelGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [labelGfx, nodeData]));
  linkDataToLinkGfx = new WeakMap(linkDataGfxPairs.map(([linkData, linkGfx]) => [linkData, linkGfx]));
  linkGfxToLinkData = new WeakMap(linkDataGfxPairs.map(([linkData, linkGfx]) => [linkGfx, linkData]));

  // initial draw
  resetViewport();
  updatePositions();
  
  viewport.on('frame-end', () => {
    if (viewport.dirty) {
      updateVisibility();
      requestRender();
      viewport.dirty = false;
    }
  });

  // destroy PIXI application on Observable cell invalidation
  invalidation.then(() => {
    if (renderRequestId) {
      window.cancelAnimationFrame(renderRequestId);
      renderRequestId = undefined;
    }
    
    app.destroy(true, true);
  });

  // prevent body scrolling
  app.view.addEventListener('wheel', event => { event.preventDefault(); });
 
  // create container
  const container = html`<div style="position: relative"></div>`;
  const toolbar = html`<div style="position: absolute; top: 0; left: 0; margin: 5px"></div>`;
  container.appendChild(toolbar);
  const infoText = html`<div style="margin-top: 10px; font-size: 0.85rem; text-shadow: 1px 1px white, 1px -1px white, -1px 1px white, -1px -1px white">
    <strong></strong><br>
    <span id="readability-score"></span><br>
  </div>`;
  const readabilityScoreText = infoText.querySelector('#readability-score');
  if (config.showFpsMeter) {
    const fpsMeterContainer = html`<div style="position: absolute; top: 0; right: 0; margin: 5px"></div>`;
    fpsMeterContainer.appendChild(fpsMeter());
    container.appendChild(fpsMeterContainer);
  }
  container.appendChild(app.view);
  
  yield container;
  
  readabilityScoreText.innerHtml = 'Computing...';
  const layoutReadability = await getLayoutReadability(graph);
  readabilityScoreText.innerText = formatFloat(layoutReadability);
}


async function _graphs(d3,point,line,circle,star,wheel,complete,triangleLattice,squareLattice,sierpinskiTriangle)
{
  const lesMiserables = await d3.json("./miserables.json");
  const socfbCaltech36 = await d3.json("https://gist.githubusercontent.com/zakjan/eb366020e5477c578456d8cf9e8e5d01/raw/373d82875ac329e0543f3f723010c53423a0588a/socfb-Caltech36.json");
  
  return {
    'Point': point(),
    'Line': line(10),
    'Circle': circle(10),
    'Star': star(10),
    'Wheel': wheel(10),
    'Complete': complete(10),
    'Triangle Lattice': triangleLattice(5),
    'Square Lattice': squareLattice(5),
    'Sierpinski Triangle': sierpinskiTriangle(3),
    'Les Misérables': lesMiserables,
    'socfb-Caltech36': socfbCaltech36,
  };
}


function _graph(hyper,multiply,graphs,config){return(
hyper(
  multiply(
    graphs[config.graph],
    parseInt(config.multiply, 10)
  ),
  parseInt(config.hyper, 10)
)
)}

function _height(){return(
600
)}

function _color(d3)
{
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return nodeData => scale(nodeData.group);
}


function _colorToNumber(){return(
color => parseInt(color.slice(1), 16)
)}

function _layouts(){return(
['d3-force', 'd3-force-reuse', 'd3-force-sampled', 'cytoscape-cola', 'cytoscape-cose', 'cytoscape-cose-bilkent', 'cytoscape-fcose', 'cytoscape-euler', 'sigma.layout.fruchtermanReingold', 'sigma.layout.forceAtlas2', 'sigma.layout.paragraphl', 'graphology-layout-forceatlas2', 'ngraph.forcelayout', 'springy', 'random']
)}

function _runLayout(){return(
(...args) => {
  return new Promise((resolve, reject) => {
    const workerCode = `
      // hotfix for Sigma
      self.document = {
        documentElement: {},
        createElement: function(tagName) {
          // hotfix for sigma.layout.paragraphl
          if (tagName === 'canvas') {
            return new OffscreenCanvas(100, 100);
          }
        }
      };
      self.HTMLElement = function() {};
      // hotfix for sigma.layout.paragraphl
      self.alert = console.error;
      Object.defineProperty(self, 'vizit', { get: function() { return window.vizit; } });

      function randomString() {
        return Math.floor(Math.random() * 10e12).toString(36);
      }

      function runD3Layout(data, d3ForceManyBodyFunc) {
        const { nodes, links } = data;
        const iterations = 300;
        const nodeRepulsion = -250;

        d3.forceSimulation(nodes)
          .force('link', d3.forceLink(links).id(linkData => linkData.id))
          .force('charge', d3ForceManyBodyFunc().strength(nodeRepulsion))
          .force('center', d3.forceCenter())
          .stop()
          .tick(iterations);

        const positions = Object.fromEntries(nodes.map(node => {
          return [node.id, { x: node.x, y: node.y }];
        }));

        return positions;
      }

      function runCytoscapeLayout(data, cytoscapeLayoutName) {
        return new Promise(resolve => {
          const { nodes, links } = data;
          const iterations = 300;
          const nodeRepulsion = 1000000;

          const cytoscapeGraph = [
            ...nodes.map(node => ({ group: 'nodes', data: node })),
            ...links.map(link => ({ group: 'edges', data: link })),
          ];

          cytoscape({
            headless: true,
            styleEnabled: false,
            layout: {
              name: cytoscapeLayoutName,
               // numIter: iterations,
              nodeRepulsion: nodeRepulsion,
              randomize: true,
              animate: false,
              stop: event => {
                const positions = Object.fromEntries(event.cy.elements('node').map(node => {
                  return [node.id(), node.position()];
                }));

                resolve(positions);
              },
            },
            elements: cytoscapeGraph,
          });
        });
      }

      async function runSigmaLayout(data, sigmaLayoutFunc) {
        const { nodes, links } = data;
        const iterations = 300;
        const scalingRatio = 40;

        const sigmaGraph = {
          nodes: nodes.map(node => ({ ...node, x: Math.random(), y: Math.random() })),
          edges: links.map(link => ({ id: randomString(), ...link }))
        };

        const s = new sigma({ graph: sigmaGraph });

        await sigmaLayoutFunc(s, { iterations, scalingRatio });

        const positions = Object.fromEntries(s.graph.nodes().map(node => {
          return [node.id, { x: node.x, y: node.y }];
        }));

        return positions;
      }

      function runGraphologyLayout(data, graphologyLayoutFunc) {
        const { nodes, links } = data;
        const iterations = 300;
        const scalingRatio = 80;

        const graph = new graphology.Graph();
        nodes.forEach(node => {
          graph.addNode(node.id);
        });
        links.forEach(link => {
          graph.addEdge(link.source, link.target);
        });

        graph.forEachNode(nodeId => {
          graph.setNodeAttribute(nodeId, 'x', Math.random());
          graph.setNodeAttribute(nodeId, 'y', Math.random());
        });

        const positions = graphologyLayoutFunc(graph, {
          iterations,
          settings: {
            ...graphologyLayoutFunc.inferSettings(graph),
            scalingRatio,
          },
        });

        return positions;
      }

      function runNgraphLayout(data, ngraphLayoutFunc) {
        const { nodes, links } = data;
        const iterations = 300;
        const gravity = -100;

        const graph = createGraph();
        nodes.forEach(node => {
          graph.addNode(node.id);
        });
        links.forEach(link => {
          graph.addLink(link.source, link.target);
        });

        const layout = ngraphLayoutFunc(graph, { gravity: gravity });
        for (let i = 0; i < iterations; i++) {
          layout.step();
        }

        const positions = Object.fromEntries(nodes.map(node => {
          return [node.id, layout.getNodePosition(node.id)];
        }));

        return positions;
      }

      function runSpringyLayout(data, springyLayoutFunc) {
        return new Promise(resolve => {
          const { nodes, links } = data;

          const graph = new Springy.Graph();
          const nodesMap = new Map(nodes.map(node => {
            return [node.id, graph.newNode({ id: node.id })];
          }));
          links.forEach(link => {
            graph.newEdge(nodesMap.get(link.source), nodesMap.get(link.target));
          });

          const layout = new springyLayoutFunc(graph, 400, 400, 0.5, 0.00001);
          layout.start(undefined, () => {
            const positions = Object.fromEntries(Array.from(nodesMap.values()).map(node => {
              const point = layout.point(node);
              return [node.data.id, { x: point.p.x * 20, y: point.p.y * 20 }];
            }));

            resolve(positions);
          });
        });
      }

      function runRandomLayout(data) {
        const { nodes } = data;

        const positions = Object.fromEntries(nodes.map(node => {
          return [node.id, { x: Math.random() * 1000, y: Math.random() * 1000 }];
        }));

        return positions;
      }

      async function runLayout(data, layoutName) {
        const layoutFuncs = new Map([
          ['d3-force', {
            importUrls: [
              'https://unpkg.com/d3@5.14.2/dist/d3.min.js',
            ],
            run: data => runD3Layout(data, d3.forceManyBody),
          }],
          ['d3-force-reuse', {
            importUrls: [
              'https://unpkg.com/d3@5.14.2/dist/d3.min.js',
              'https://unpkg.com/d3-force-reuse@1.0.1/build/d3-force-reuse.js',
            ],
            run: data => runD3Layout(data, d3.forceManyBodyReuse),
          }],
          ['d3-force-sampled', {
            importUrls: [
              'https://unpkg.com/d3@5.14.2/dist/d3.min.js',
              'https://unpkg.com/d3-force-sampled@1.0.0/build/d3-force-sampled.js',
            ],
            run: data => runD3Layout(data, d3.forceManyBodySampled),
          }],
          ['cytoscape-cose', {
            importUrls: [
              'https://unpkg.com/cytoscape@3.13.0/dist/cytoscape.min.js',
            ],
            run: data => runCytoscapeLayout(data, 'cose'),
          }],
          ['cytoscape-cola', {
            importUrls: [
              'https://unpkg.com/cytoscape@3.13.0/dist/cytoscape.min.js',
              'https://bundle.run/cytoscape-cola@2.3.0',
            ],
            run: data => runCytoscapeLayout(data, 'cola'),
          }],
          ['cytoscape-cose-bilkent', {
            importUrls: [
              'https://unpkg.com/cytoscape@3.13.0/dist/cytoscape.min.js',
              'https://unpkg.com/layout-base@1.0.2/layout-base.js',
              'https://unpkg.com/cose-base@1.0.1/cose-base.js',
              'https://unpkg.com/cytoscape-cose-bilkent@4.1.0/cytoscape-cose-bilkent.js',
            ],
            run: data => runCytoscapeLayout(data, 'cose-bilkent'),
          }],
          ['cytoscape-fcose', {
            importUrls: [
              'https://unpkg.com/cytoscape@3.13.0/dist/cytoscape.min.js',
              'https://unpkg.com/numeric@1.2.6/numeric-1.2.6.js',
              'https://unpkg.com/layout-base@1.0.2/layout-base.js',
              'https://unpkg.com/cose-base@1.0.1/cose-base.js',
              'https://unpkg.com/cytoscape-fcose@1.2.0/cytoscape-fcose.js',
            ],
            run: data => runCytoscapeLayout(data, 'fcose'),
          }],
          ['cytoscape-euler', {
            importUrls: [
              'https://unpkg.com/cytoscape@3.13.0/dist/cytoscape.min.js',
              'https://unpkg.com/cytoscape-euler@1.2.2/cytoscape-euler.js',
            ],
            run: data => runCytoscapeLayout(data, 'euler'),
          }],
          ['sigma.layout.fruchtermanReingold', {
            importUrls: [
              'https://unpkg.com/sigma@1.2.1/build/sigma.require.js',
              'https://unpkg.com/sigma@1.2.1/build/plugins/sigma.plugins.animate.min.js',
              'https://unpkg.com/linkurious@1.5.2/dist/plugins/sigma.layouts.fruchtermanReingold.min.js'
            ],
            run: data => runSigmaLayout(
              data,
              async (s, config) => {
                const listener = sigma.layouts.fruchtermanReingold.configure(s, {
                  maxIterations: config.iterations
                });
                const promise = new Promise(resolve => listener.bind('stop', resolve));
                sigma.layouts.fruchtermanReingold.start(s);
                await promise;

                const scalingRatio = 10;
                s.graph.nodes().forEach(node => {
                  node.x = node.x * scalingRatio;
                  node.y = node.y * scalingRatio;
                });
              }
            ),
          }],
          ['sigma.layout.forceAtlas2', {
            importUrls: [
              'https://unpkg.com/sigma@1.2.1/build/sigma.require.js',
              'https://unpkg.com/sigma@1.2.1/build/plugins/sigma.layout.forceAtlas2.min.js'
            ],
            run: data => runSigmaLayout(
              data,
              async (s, config) => {
                s.startForceAtlas2({
                  startingIterations: config.iterations,
                  iterationsPerRender: 0,
                  scalingRatio: config.scalingRatio
                });
                await new Promise(resolve => setTimeout(resolve, 500));
                s.killForceAtlas2();
              }
            ),
          }],
          ['sigma.layout.paragraphl', {
            importUrls: [
              'https://unpkg.com/sigma@1.2.1/build/sigma.require.js',
              'https://unpkg.com/sigma@1.2.1/build/plugins/sigma.plugins.animate.min.js',
              'https://cdn.jsdelivr.net/gh/nblintao/ParaGraphL@master/GPGPUtility.js',
              'https://cdn.jsdelivr.net/gh/nblintao/ParaGraphL@master/sigma.layout.paragraphl.js'
            ],
            run: data => runSigmaLayout(
              data,
              async (s, config) => {
                var listener = sigma.layouts.paragraphl.configure(s, {
                  iterations: config.iterations
                });
                const promise = new Promise(resolve => listener.bind('stop', resolve));
                sigma.layouts.paragraphl.start(s);
                await promise;

                const scalingRatio = 10;
                s.graph.nodes().forEach(node => {
                  node.x = node.x * scalingRatio;
                  node.y = node.y * scalingRatio;
                });
              }
            )
          }],
          ['graphology-layout-forceatlas2', {
            importUrls: [
              'https://unpkg.com/graphology@0.17.0/dist/graphology.umd.js',
              'https://unpkg.com/graphology-layout-forceatlas2@0.4.2/build/graphology-layout-forceatlas2.min.js',
            ],
            run: data => runGraphologyLayout(data, forceAtlas2),
          }],
          ['ngraph.forcelayout', {
            importUrls: [
              'https://unpkg.com/ngraph.graph@19.0.2/dist/ngraph.graph.min.js',
              'https://bundle.run/ngraph.forcelayout@1.0.0/index.js',
            ],
            run: data => runNgraphLayout(data, ngraph_forcelayout),
          }],
          ['springy', {
            importUrls: [
              'https://unpkg.com/springy@2.8.0/springy.js',
            ],
            run: data => runSpringyLayout(data, Springy.Layout.ForceDirected),
          }],
          ['random', {
            run: data => runRandomLayout(data),
          }],
        ]);

        const layoutFunc = layoutFuncs.get(layoutName);
        if (!layoutFunc) {
          throw new Error('Unknown layout ' + layoutName);
        }

        // import layout dependencies
        if (layoutFunc.importUrls) {
          layoutFunc.importUrls.forEach(importUrl => {
           importScripts(importUrl);
          });
        }

        // run layout and measure time
        const startTime = performance.now();
        const positions = await layoutFunc.run(data);
        const endTime = performance.now();
        const layoutTime = endTime - startTime;
        const result = { positions, layoutTime };

        return result;
      };

      self.onmessage = async event => {
        const result = await runLayout.apply(undefined, event.data);
        self.postMessage(result);
      }
    `;

    const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob)
    const worker = new Worker(workerUrl);

    worker.onmessage = event => {
      resolve(event.data);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    worker.postMessage(args);
  });
}
)}

function _getLayoutReadability(){return(
(...args) => {
  return new Promise((resolve, reject) => {
    const workerCode = `
      importScripts('https://cdn.jsdelivr.net/gh/rpgove/greadability@master/greadability.js');

      function getLayoutReadability(graph) {
        const layoutQuality = greadability.greadability(
          JSON.parse(JSON.stringify(graph.nodes)),
          JSON.parse(JSON.stringify(graph.links)),
          d => d.id,
        );
        const layoutReadability = (layoutQuality.crossing + layoutQuality.crossingAngle + layoutQuality.angularResolutionMin + layoutQuality.angularResolutionDev) / 4;

        return layoutReadability;
      }

      self.onmessage = async event => {
        const result = await getLayoutReadability.apply(undefined, event.data);
        self.postMessage(result);
      }
    `;

    const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob)
    const worker = new Worker(workerUrl);

    worker.onmessage = event => {
      resolve(event.data);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    worker.postMessage(args);
  });
}
)}

function _13(md){return(
md``
)}

function _d3(require){return(
require("d3@5.14.2")
)}

function _15(html){return(
html`<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`
)}

function _FontFaceObserver(require){return(
require('fontfaceobserver@2.1.0').catch(() => window.FontFaceObserver)
)}

function _PIXI(require){return(
require('pixi.js@5.2.0/dist/pixi.min.js').catch(async () => {
  window.PIXI.Cull = (await require('https://bundle.run/@pixi-essentials/cull@1.0.5/dist/cull.js')).PIXI.Cull;
  return window.PIXI;
})
)}

async function _Viewport(require){return(
(await require('https://bundle.run/pixi-viewport@4.5.0/dist/viewport.js')).Viewport
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof config")).define("viewof config", ["inputsForm","select","graphs","formatInt","layouts","checkbox"], _config);
  main.variable(observer("config")).define("config", ["Generators", "viewof config"], (G, _) => G.input(_));
  main.variable(observer()).define(["md","formatInt","graph"], _3);
  main.variable(observer("chart")).define("chart", ["width","height","html","runLayout","graph","config","PIXI","FontFaceObserver","Viewport","uniq","colorToNumber","color","invalidation","formatInt","fpsMeter","getLayoutReadability","formatFloat"], _chart);
  main.variable(observer("graphs")).define("graphs", ["d3","point","line","circle","star","wheel","complete","triangleLattice","squareLattice","sierpinskiTriangle"], _graphs);
  main.variable(observer("graph")).define("graph", ["hyper","multiply","graphs","config"], _graph);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("colorToNumber")).define("colorToNumber", _colorToNumber);
  main.variable(observer("layouts")).define("layouts", _layouts);
  main.variable(observer("runLayout")).define("runLayout", _runLayout);
  main.variable(observer("getLayoutReadability")).define("getLayoutReadability", _getLayoutReadability);
  main.variable(observer()).define(["md"], _13);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer()).define(["html"], _15);
  main.variable(observer("FontFaceObserver")).define("FontFaceObserver", ["require"], _FontFaceObserver);
  main.variable(observer("PIXI")).define("PIXI", ["require"], _PIXI);
  main.variable(observer("Viewport")).define("Viewport", ["require"], _Viewport);
  const child1 = runtime.module(define1);
  main.import("select", child1);
  main.import("checkbox", child1);
  const child2 = runtime.module(define2);
  main.import("inputsForm", child2);
  const child3 = runtime.module(define3);
  main.import("fpsMeter", child3);
  const child4 = runtime.module(define4);
  main.import("uniq", child4);
  main.import("formatInt", child4);
  main.import("formatFloat", child4);
  main.import("randomString", child4);
  const child5 = runtime.module(define5);
  main.import("point", child5);
  main.import("line", child5);
  main.import("circle", child5);
  main.import("star", child5);
  main.import("wheel", child5);
  main.import("complete", child5);
  main.import("triangleLattice", child5);
  main.import("squareLattice", child5);
  main.import("sierpinskiTriangle", child5);
  main.import("multiply", child5);
  main.import("hyper", child5);
  return main;
}
