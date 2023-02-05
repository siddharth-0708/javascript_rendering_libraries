// https://observablehq.com/@zakjan/graph-utils@304
import define1 from "./8eabfd5bcf898b2a@30.js";

function _1(md){return(
md`# Graph utils`
)}

function _2(md){return(
md`## Generators

- point
- line
- circle
- star
- wheel
- complete
- triangle lattice
- square lattice
- Sierpinski triangle

Generated graphs have d3-like structure:

\`\`\`
interface Graph {
  nodes: Node[];
  links: Link[];
}

interface Node {
  id: number;
}

interface Link {
  source: number;
  target: number;
}
\`\`\`
`
)}

function _point(offset){return(
(start = 0, step = 1) => {
  return {
    nodes: [
      { id: offset(0, start, step) },
    ],
    links: [],
  };
}
)}

function _line(range,offset){return(
(n, start = 0, step = 1) => {
  return {
    nodes: range(n).map(i => {
      return { id: offset(i, start, step) };
    }),
    links: range(n - 1).map(i => {
      return { source: offset(i, start, step), target: offset(i + 1, start, step) };
    }),
  };
}
)}

function _circle(range,offset){return(
(n, start = 0, step = 1) => {
  return {
    nodes: range(n).map(i => {
      return { id: offset(i, start, step) };
    }),
    links: range(n).map(i => {
      return { source: offset(i, start, step), target: offset((i + 1) % n, start, step) };
    }),
  };
}
)}

function _star(offset,range){return(
(n, start = 0, step = 1) => {
  return {
    nodes: [
      { id: offset(0, start, step) },
      ...range(n).map(i => {
        return { id: offset(i + 1, start, step) };
      }),
    ],
    links: range(n).map(i => {
      return { source: offset(0, start, step), target: offset(i + 1, start, step) };
    }),
  };
}
)}

function _wheel(star,circle,merge){return(
(n, start = 0, step = 1) => {
  const starGraph = star(n, start, step);
  const circleGraph = circle(n, start + 1, step);
  
  return merge(starGraph, circleGraph);
}
)}

function _complete(range,offset){return(
(n, start = 0, step = 1) => {
  return {
    nodes: range(n).map(i => {
      return { id: offset(i, start, step) };
    }),
    links: range(n).flatMap(i => {
      return range(n).filter(j => j > i).map(j => {
        return { source: offset(i, start, step), target: offset(j, start, step) };
      });
    }),
  };
}
)}

function _triangleLattice(range,line,merge,empty){return(
(n, start = 0, step = 1) => {
  const xLineGraphs = range(n).map(i => {
    return line(n - i, start + 10 * (i + 1), step);
  });
  const yLineGraphs = range(n).map(i => {
    return line(n - i, start + 10 + i, step * 10);
  });
  const zLineGraphs = range(n).map(i => {
    return line(n - i, start + 10 + n - i - 1, step * (10 - 1));
  });
  const lineGraphs = [...xLineGraphs, ...yLineGraphs, ...zLineGraphs];
  
  return lineGraphs.reduce(merge, empty());
}
)}

function _squareLattice(range,line,merge,empty){return(
(n, start = 0, step = 1) => {
  const xLineGraphs = range(n).map(i => {
    return line(n, start + 10 * (i + 1), step);
  });
  const yLineGraphs = range(n).map(i => {
    return line(n, start + 10 + i, step * 10);
  });
  const lineGraphs = [...xLineGraphs, ...yLineGraphs];
  
  return lineGraphs.reduce(merge, empty());
}
)}

function _sierpinskiTriangle(merge,empty,offset){return(
(n, start = 0, step = 1) => {
  const makeGraphFromTriangle = triangle => {
    return {
      nodes: [
        { id: `${triangle[0]}` },
        { id: `${triangle[1]}` },
        { id: `${triangle[2]}` },
      ],
      links: [
        { source: `${triangle[0]}`, target: `${triangle[1]}` },
        { source: `${triangle[1]}`, target: `${triangle[2]}` },
        { source: `${triangle[2]}`, target: `${triangle[0]}` },
      ],
    }
  };
  const makeGraphFromTriangles = triangles => {
    return triangles.map(makeGraphFromTriangle).reduce(merge, empty());
  };
  const splitTriangle = triangle => {
    return [
      [`${triangle[0]}`, `(${[triangle[0], triangle[1]].sort()})`, `(${[triangle[0], triangle[2]].sort()})`],
      [`${triangle[1]}`, `(${[triangle[0], triangle[1]].sort()})`, `(${[triangle[1], triangle[2]].sort()})`],
      [`${triangle[2]}`, `(${[triangle[0], triangle[2]].sort()})`, `(${[triangle[1], triangle[2]].sort()})`],
    ];
  };
  const splitTriangles = triangles => {
    return triangles.flatMap(triangle => splitTriangle(triangle));
  };
  let triangles = [
    [
      offset(0, start, step),
      offset(1, start, step),
      offset(2, start, step),
    ],
  ];
  if (n === 0) {
    return makeGraphFromTriangles(triangles);
  }
  
  for (let i = 0; i < n; i++) {
    triangles = splitTriangles(triangles);
  }
  return makeGraphFromTriangles(triangles);
}
)}

function _12(md){return(
md`## Operations`
)}

function _empty(){return(
() => {
  return {
    nodes: [],
    links: [],
  };
}
)}

function _merge(uniq){return(
(graph1, graph2) => {
  return {
    nodes: uniq([...graph1.nodes, ...graph2.nodes].map(node => node.id)).map(id => {
      return { id: id };
    }),
    links: [...graph1.links, ...graph2.links],
  };
}
)}

function _multiply(empty,range){return(
(graph, n = 1) => {
  if (n === 0) {
    return empty();
  }
  if (n === 1) {
    return graph;
  }
  
  graph = {
    nodes: range(n).flatMap(i => {
      return graph.nodes.map(node => {
        return { ...node, id: `${node.id}#${i}` };
      });
    }),
    links: range(n).flatMap(i => {
      return graph.links.map(link => {
        return { ...link, source: `${link.source}#${i}`, target: `${link.target}#${i}` };
      });
    }),
  };
  
  return graph;
}
)}

function _hyper(){return(
(graph, n = 0) => {
  if (n === 0) {
    return graph;
  }
  
  for (let i = 0; i < n; i++) {
    const separator = i === 0 ? '#' : '';
    
    graph = {
      nodes: graph.nodes.flatMap(node => {
        return [
          { ...node, id: `${node.id}${separator}0` },
          { ...node, id: `${node.id}${separator}1` },
        ];
      }),
      links: [
        ...graph.nodes.flatMap(node => {
          return { source: `${node.id}${separator}0`, target: `${node.id}${separator}1` };
        }),
        ...graph.links.flatMap(link => {
          return [
            { ...link, source: `${link.source}${separator}0`, target: `${link.target}${separator}0` },
            { ...link, source: `${link.source}${separator}1`, target: `${link.target}${separator}1` },
          ];
        }),
      ],
    };
  }
  
  return graph;
}
)}

function _17(md){return(
md`## Imports`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("point")).define("point", ["offset"], _point);
  main.variable(observer("line")).define("line", ["range","offset"], _line);
  main.variable(observer("circle")).define("circle", ["range","offset"], _circle);
  main.variable(observer("star")).define("star", ["offset","range"], _star);
  main.variable(observer("wheel")).define("wheel", ["star","circle","merge"], _wheel);
  main.variable(observer("complete")).define("complete", ["range","offset"], _complete);
  main.variable(observer("triangleLattice")).define("triangleLattice", ["range","line","merge","empty"], _triangleLattice);
  main.variable(observer("squareLattice")).define("squareLattice", ["range","line","merge","empty"], _squareLattice);
  main.variable(observer("sierpinskiTriangle")).define("sierpinskiTriangle", ["merge","empty","offset"], _sierpinskiTriangle);
  main.variable(observer()).define(["md"], _12);
  main.variable(observer("empty")).define("empty", _empty);
  main.variable(observer("merge")).define("merge", ["uniq"], _merge);
  main.variable(observer("multiply")).define("multiply", ["empty","range"], _multiply);
  main.variable(observer("hyper")).define("hyper", _hyper);
  main.variable(observer()).define(["md"], _17);
  const child1 = runtime.module(define1);
  main.import("offset", child1);
  main.import("range", child1);
  main.import("uniq", child1);
  return main;
}
