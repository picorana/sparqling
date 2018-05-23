class window.PainlessUtils

    constructor: ->
        @a = 0

    generate_style: ->
        return new cytoscape.stylesheet()

            ###* EDGES ###

            .selector('edge')
                .style({
                    'curve-style': 'bezier'
                    'width' : 3
                    'source-endpoint' : 'outside-to-node'
                    'target-endpoint' : 'outside-to-node'
                    'arrow-scale' : 1.5
                    'line-color' : '#839496'
                    'font-family' : "Roboto"
                    'font-size' : '10'
                    'text-outline-color' : '#fdf6e3'
                    'text-outline-width' : '2px'
                    'color' : '#002b36'
                })
            .selector('.source-edge')
                .style({
                    'target-arrow-shape' : 'square'
                    'target-arrow-fill' : 'hollow'
                    'target-arrow-color' : '#002b36'
                })
            .selector('.target-edge')
                .style({
                    'target-arrow-shape' : 'square'
                    'target-arrow-color' : '#002b36'
                })
            .selector('.edge-datatype')
                .style({
                    'line-style' : 'dotted'
                })
            .selector('.edge-concept')
                .style({
                    'content' : 'rdf:type'
                })

            ###* NODES ###

            .selector('node')
                .style({
                    'background-color' : 'black',
                    'shape' : 'rectangle'
                })
            .selector('.node-domain')
                .style({
                    'background-color' : '#002b36'
                    'border-color' : '#002b36'
                    'border-style' : 'solid'
                    'border-width' : '0.5px'
                    'width' : 15
                    'height' : 15
                })
            .selector('.node-range')
                .style({
                    'background-color' : '#fdf6e3'
                    'border-color' : '#002b36'
                    'border-style' : 'solid'
                    'border-width' : '2px'
                    'width' : 15
                    'height' : 15
                })
            .selector('.node-datatype')
                .style({
                    'shape' : 'ellipse'
                    'background-color' : '#93a1a1'
                    'content' : 'data(label)'
                    'text-valign' : 'center'
                    'font-family' : "Roboto";
                    'font-size' : '12'
                    'width' : 15
                    'height' : 15
                })
            .selector('.node-role')
                .style({
                    'shape' : 'diamond'
                    'background-color' : '#fdf6e3'
                    'border-style' : 'solid'
                    'border-color' : '#002b36'
                    'color' : '#002b36'
                    'border-width' : '4px' 
                    'content' : 'data(label)'
                    'text-valign' : 'center'
                    'font-family' : "Roboto";
                    'text-outline-color' : '#fdf6e3'
                    'text-outline-width' : '3px'
                    'width' : 90
                    'height' : 60
                })
            .selector('.node-attribute')
                .style({
                    'shape' : 'ellipse'
                    'background-color' : '#fdf6e3'
                    'border-style' : 'solid'
                    'border-color' : '#002b36'
                    'color' : '#002b36'
                    'border-width' : '4px' 
                    'content' : 'data(label)'
                    'text-valign' : 'center'
                    'font-family' : "Roboto";
                    'text-outline-color' : '#fdf6e3'
                    'text-outline-width' : '3px'
                    'width' : 30
                    'height' : 30
                })
            .selector('.node-variable')
                .style({
                    'shape' : 'ellipse'
                    'background-color' : (ele) ->
                        return ele.data('color')
                    'width' : (ele) ->
                        return 100
                    'height' : (ele) ->
                        return 100
                    'text-valign' : 'center'
                    'font-size' : '30'
                    'font-family' : "Roboto";
                    'color' : '#fdf6e3'
                    'text-outline-color' : (ele) -> return ele.data('color')
                    'text-outline-width' : '5px'
                    'content' : 'data(label)'
                })
            .selector('.node-constant-value')
                .style({
                    'shape' : 'ellipse'
                    'background-color' : (ele) ->
                        return ele.data('color')
                    'width' : (ele) ->
                        return 100
                    'height' : (ele) ->
                        return 100
                    'text-valign' : 'center'
                    'font-size' : '20'
                    'font-family' : "Roboto";
                    'color' : '#fdf6e3'
                    'text-outline-color' : '#fdf6e3'
                    'text-outline-width' : '0px'
                    'content' : 'data(label)'
                })
            .selector('.node-constant-object')
                .style({
                    'shape' : 'ellipse'
                    'background-color' : (ele) ->
                        return ele.data('color')
                    'width' : (ele) ->
                        return 100
                    'height' : (ele) ->
                        return 100
                    'text-valign' : 'center'
                    'font-size' : '20'
                    'font-family' : "Roboto";
                    'color' : '#fdf6e3'
                    'text-outline-color' : '#fdf6e3'
                    'text-outline-width' : '0px'
                    'content' : 'data(label)'
                })
            .selector('.node-concept')
                .style({
                    'shape' : 'rectangle'
                    'background-color' : '#073642'
                    'content' : 'data(label)'
                    'text-valign' : 'center'
                    'width' : (ele) ->
                        return ele.data('label').length * 10 + 50 #compute text length?
                    'height' : '80'
                    'border-color' : '#073642'
                    'border-width' : '2px'
                    'font-family' : "Roboto";
                    'font-size' : '20'
                    'color' : '#fdf6e3'
                    'border-style' : 'solid'
                })
            .selector('node.highlight')
                .style({
                    'border-color' : '#333'
                    'border-opacity' : '0.5'
                    'border-width' : '20px'
                    'border-style' : 'solid'
                })
            .selector('node.filtered')
                .style({
                    'border-color' : '#ff0000'
                    'border-opacity' : '1'
                    'border-width' : '20px'
                    'border-style' : 'double'
                })
            .selector('node:selected')
                .style({
                    'border-color' : '#daa'
                    'border-opacity' : '0.5'
                    'border-width' : '20px'
                    'border-style' : 'solid'
                })

