<div style='text-align: center'><h1><b>Painless Sparql</b></h1></div>

A graphical tool to write SPARQL queries.

## Usage
Clone the repository with 

	git clone https://github.com/picorana/painless_sparql

Then import app.js in your graphol html visualization:
	
	<script type="text/javascript" src="./js/app.js"></script>

An example graphol visualization can be found here: [GrapholScape](https://gianluca-pepe.github.io/GrapholScape/)

## Contribute

Clone the repository

	git clone https://github.com/picorana/painless_sparql

and run    

	node install

that will take care of downloading the dev dependencies.

Then run
	
	gulp

in the base project directory. The default behaviour of gulp is to watch for changes in the ```.coffee ``` folder and recompile
the coffee files, bundling them into app.js. You can force ```gulp``` to just build once with ```gulp build``` 
or to watch for changes with ```gulp watch```
