
generate_style = ->
    return new cytoscape.stylesheet()
        .selector('node')
            .style({
                'background-color' : 'black',
                'shape' : 'rectangle'
            })
        .selector('.node-domain')
            .style({
                'background-color' : 'black'
                'border-color' : 'black'
                'border-style' : 'solid'
                'border-width' : '0.5px'
                'width' : 30
                'height' : 30
            })
        .selector('.node-range')
            .style({
                'background-color' : 'white'
                'border-color' : 'black'
                'border-style' : 'solid'
                'border-width' : '2px'
                'width' : 30
                'height' : 30
            })
        .selector('.node-role')
            .style({
                'shape' : 'diamond'
                'background-color' : 'white'
                'border-style' : 'solid'
                'border-color' : 'black'
                'border-width' : '2px' 
                'content' : 'data(label)'
                'width' : 90
                'color' : 'black'
                'height' : 60
            })
        .selector('.node-attribute')
            .style({
                'shape' : 'ellipse'
                'background-color' : 'white'
                'border-style' : 'solid'
                'border-color' : 'black'
                'border-width' : '2px' 
                'content' : 'data(label)'
                'width' : 30
                'color' : 'black'
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
                'font-size' : '40'
                'font-family' : "Courier New";
                'color' : 'white'
                'text-outline-color' : 'black'
                'text-outline-width' : '2px'
                'content' : 'data(label)'
            })
        .selector('.node-concept')
            .style({
                'shape' : 'rectangle'
                'background-color' : 'white'
                'content' : 'data(label)'
                'text-valign' : 'center'
                'width' : (ele) ->
                    return ele.data('label').length * 10 #compute text length?
                'height' : '30'
                'border-color' : '#000'
                'border-width' : '2px'
                'border-style' : 'solid'
            })
        .selector('node.highlight')
            .style({
                'border-color' : '#333'
                'border-opacity' : '0.5'
                'border-width' : '20px'
                'border-style' : 'solid'
            })
        .selector('node:selected')
            .style({
                'border-color' : '#daa'
                'border-opacity' : '0.5'
                'border-width' : '20px'
                'border-style' : 'solid'
            })

