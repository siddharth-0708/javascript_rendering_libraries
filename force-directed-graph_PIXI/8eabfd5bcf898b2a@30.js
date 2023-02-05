// https://observablehq.com/@zakjan/utils@30
function _1(md){return(
md`# Utils`
)}

function _formatInt(){return(
value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
)}

function _formatFloat(){return(
value => new Intl.NumberFormat('en-US').format(value)
)}

function _offset(){return(
(i, start, step) => start + i * step
)}

function _range(){return(
n => new Array(n).fill(undefined).map((_, i) => i)
)}

function _uniq(){return(
items => Array.from(new Set(items))
)}

function _randomNumber(){return(
(min, max) => Math.floor(Math.random() * (max - min + 1)) + min
)}

function _randomString(){return(
() => Math.floor(Math.random() * 10e12).toString(36)
)}

function _randomUuid(){return(
() => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("formatInt")).define("formatInt", _formatInt);
  main.variable(observer("formatFloat")).define("formatFloat", _formatFloat);
  main.variable(observer("offset")).define("offset", _offset);
  main.variable(observer("range")).define("range", _range);
  main.variable(observer("uniq")).define("uniq", _uniq);
  main.variable(observer("randomNumber")).define("randomNumber", _randomNumber);
  main.variable(observer("randomString")).define("randomString", _randomString);
  main.variable(observer("randomUuid")).define("randomUuid", _randomUuid);
  return main;
}
