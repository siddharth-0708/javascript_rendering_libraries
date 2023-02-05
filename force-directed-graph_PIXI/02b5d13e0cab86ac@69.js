// https://observablehq.com/@zakjan/inputs-form@69
import define1 from "./e93997d5089d7165@2303.js";

function _1(md){return(
md`# Inputs Form

Combine inputs from [@jashkenas/inputs](https://observablehq.com/@jashkenas/inputs) to a single form, returning an object. Supports hiding inputs by other input values.

Inspired by [@mbostock/form-input](https://observablehq.com/@mbostock/form-input)`
)}

function _config(inputsForm,radio,slider){return(
inputsForm([
  {
    name: 'type',
    element: radio({
      title: 'Type',
      options: [
        { label: 'Absolute', value: 'absolute' },
        { label: 'Relative', value: 'relative' }
      ],
      value: 'absolute'
    }),
  },
  {
    name: 'absoluteValue',
    element: slider({
      min: 0, 
      max: 100, 
      step: 1, 
      value: 50, 
      title: "Absolute value"
    }),
    hidden: value => value.type !== 'absolute',
  },
  {
    name: 'relativeValue',
    element: slider({
      min: 0, 
      max: 1, 
      step: 0.01, 
      value: 0.2,
      format: ".0%",
      title: "Relative value"
    }),
    hidden: value => value.type !== 'relative',
  },
])
)}

function _3(config){return(
config
)}

function _inputsForm(html){return(
inputs => {
  const container = html`<div>`;
  container.value = Object.fromEntries(inputs.map(({name, element}) => [name, element.value]));
  
  const update = () => {
    for (let {name, element, hidden} of inputs) {
      const hiddenResolved = typeof hidden === "function" ? hidden(container.value) : hidden;
      element.style.display = 'none';
    }
  }
  
  for (let {name, element, hidden} of inputs) {
    container.appendChild(element);
    element.style.marginBottom = '0.5em';
    element.addEventListener('input', () => {
      container.value[name] = element.value;
      update();
    });
  }
  
  update();
  
  return container;
}
)}

function _5(md){return(
md`## Imports`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof config")).define("viewof config", ["inputsForm","radio","slider"], _config);
  main.variable(observer("config")).define("config", ["Generators", "viewof config"], (G, _) => G.input(_));
  main.variable(observer()).define(["config"], _3);
  main.variable(observer("inputsForm")).define("inputsForm", ["html"], _inputsForm);
  main.variable(observer()).define(["md"], _5);
  const child1 = runtime.module(define1);
  main.import("radio", child1);
  main.import("slider", child1);
  return main;
}
