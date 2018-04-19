#!/bin/sh

mkdir lib
cd lib

touch dragula.js
curl -0 https://raw.githubusercontent.com/bevacqua/dragula/master/dist/dragula.js >> dragula.js

touch cytoscape-cola.js
curl -0 https://raw.githubusercontent.com/cytoscape/cytoscape.js-cola/master/cytoscape-cola.js >> cytoscape-cola.js
