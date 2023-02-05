// https://observablehq.com/@zakjan/fps-meter@39
function _1(md){return(
md`# FPS meter`
)}

function _2(fpsMeter){return(
fpsMeter()
)}

function _fpsMeter(Stats,invalidation){return(
() => {
  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = 'static';

  let running = true;
  requestAnimationFrame(function animate() {
    stats.update();
    
    if (running) {
      requestAnimationFrame(animate);
    }
  });
  
  invalidation.then(() => {
    running = false;
  });
  
  return stats.dom;
}
)}

function _4(md){return(
md`## Imports`
)}

function _Stats(require){return(
require('stats.js@0.17.0')
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["fpsMeter"], _2);
  main.variable(observer("fpsMeter")).define("fpsMeter", ["Stats","invalidation"], _fpsMeter);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer("Stats")).define("Stats", ["require"], _Stats);
  return main;
}
