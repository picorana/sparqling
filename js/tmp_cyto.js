// @format

cy = cytoscape({
  container: document.getElementById('cy'),
  style: [
    {
      selector: 'node',
      style: {
        shape: 'hexagon',
        'background-color': 'red',
        label: 'data(id)',
      },
    },
  ],
  layout: {
    name: 'grid',
  },
  elements: [
    // nodes
    {data: {id: 'a'}},
    {data: {id: 'b'}},
    {data: {id: 'c'}},
    {data: {id: 'd'}},
    {data: {id: 'e'}},
    {data: {id: 'f'}},
    // edges
    {
      data: {
        id: 'ab',
        source: 'a',
        target: 'b',
      },
    },
    {
      data: {
        id: 'cd',
        source: 'c',
        target: 'd',
      },
    },
    {
      data: {
        id: 'ef',
        source: 'e',
        target: 'f',
      },
    },
    {
      data: {
        id: 'ac',
        source: 'a',
        target: 'd',
      },
    },
    {
      data: {
        id: 'be',
        source: 'b',
        target: 'e',
      },
    },
  ],
});
