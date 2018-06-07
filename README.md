<div style='text-align: center'><h1><b>Sparqling</b></h1></div>

<a class="badge-align" href="https://www.codacy.com/app/picorana/painless_sparql?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=picorana/painless_sparql&amp;utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/b728a529586a4a1ba3cb6c1d17471b17"/></a> <img src="https://david-dm.org/picorana/painless_sparql.svg"/>

A graphical tool to write SPARQL queries.

<div style='text-align: center'> <img width='80%' style='border-radius: 100px; box-shadow: 5px 5px 3px 5px #88888855;' src='./res/gif1.gif'></img> </div>

## [Demo](https://picorana.github.io/sparqling/) &#9679; [Video](https://www.youtube.com/watch?v=5Vla5h8W5sg&feature=youtu.be) &#9679; [Docs/tutorial](https://picorana.github.io/sparqling/docs_index.html) &#9679; [github](https://github.com/picorana/sparqling)


## Table of contents
- [Usage](#usage)
- [Documentation index](#documentation-index)
- [Contribute](#contribute)
- [Disclaimer](#disclaimer)


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


## Documentation index
- [sparqling.coffee](./coffee/sparqling.html)   
- [sparqling_graph.coffee](./coffee/sparqling_graph.html)   
- [sparqling_link.coffee](./coffee/sparqling_link.html)   
- [sparqling_menu.coffee](./coffee/sparqling_menu.html)   
- [sparqling_navbar.coffee](./coffee/sparqling_navbar.html)   
- [sparqling_context_menu.coffee](./coffee/sparqling_context_menu.html)   
- [sparqling_alert.coffee](./coffee/sparqling_alert.html) 
- [sparql_text.coffee](./coffee/sparql_text.html)   
- [query_line.coffee](./coffee/query_line.html)   
- [query_filter.coffee](./coffee/query_filter.html)   
- [hl_box.coffee](./coffee/hl_box.html)   
- [void.coffee](./coffee/void.html)   
- [style.coffee](./coffee/style.html)   
- [constants.coffee](./coffee/constants.html) 


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
