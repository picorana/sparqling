<div style='text-align: center'><h1><b>Sparqling</b></h1></div>

<a class="badge-align" href="https://www.codacy.com/app/picorana/painless_sparql?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=picorana/painless_sparql&amp;utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/b728a529586a4a1ba3cb6c1d17471b17"/></a> <img src="https://david-dm.org/picorana/painless_sparql.svg"/>

A graphical tool to write SPARQL queries.

## [Demo](https://picorana.github.io/sparqling/)
## [Video](https://www.youtube.com/watch?v=5Vla5h8W5sg&feature=youtu.be)

## Usage
Clone the repository with 

	git clone https://github.com/picorana/sparqling

Then import app.js and the css style in your graphol html visualization:
	
	<link href="../sparqling/css/style.css"/ rel="stylesheet">
	<script type="text/javascript" src="./dist/sparqling.js"></script>

After importing the script, initialize it with

	var ps = new Sparqling(graph);
	
in which `graph` is an instance of a GrapholScape graph.

An example graphol visualization can be found here: [GrapholScape](https://gianluca-pepe.github.io/GrapholScape/)   
A working demo of this project can be found here: [demo](https://picorana.github.io/sparqling/)

CDN:   
	
	https://rawgit.com/picorana/sparqling/master/css/style.css
	https://rawgit.com/picorana/sparqling/master/dist/sparqling_min.js


## Contribute

Clone the repository

	git clone https://github.com/picorana/sparqling

and run    

	node install

that will take care of downloading the dev dependencies.

Then run
	
	gulp

in the base project directory. The default behaviour of gulp is to watch for changes in the `.coffee ` folder and recompile
the coffee files, bundling them into sparqling.js. You can force `gulp` to just build once with `gulp build` 
or to watch for changes with `gulp watch`

The project is developed in `coffeescript`, and the source files are contained in the `coffee` folder of this repository. `gulp` is used to compile coffeescript to javascript and to bundle the project files together with the third party libraries. The final result is stored in the `dist` folder.

## Disclaimer 
Based on [GrapholScape](https://github.com/gianluca-pepe/GrapholScape) by [gianluca-pepe](https://github.com/gianluca-pepe).   
Developed with [cytoscape.js](http://js.cytoscape.org) in [coffeescript](http://coffeescript.org)

Supported by [OBDA Systems](https://www.obdasystems.com).
