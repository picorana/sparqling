
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
                'border-width' : '2px'
            })
        .selector('.node-range')
            .style({
                'background-color' : 'white'
                'border-color' : 'black'
                'border-style' : 'solid'
                'border-width' : '2px'
            })
        .selector('.node-attribute')
            .style({
                'shape' : 'ellipse'
                'background-color' : 'white'
                'border-style' : 'solid'
                'border-color' : 'black'
                'border-width' : '2px' 
                'content' : 'data(id)'
            })
        .selector('.node-variable')
            .style({
                'shape' : 'ellipse'
                'background-color' : 'gray'
                'width' : (ele) ->
                    return 50 + (ele.neighborhood('edge').length*50)
                'height' : (ele) ->
                    return 50 + (ele.neighborhood('edge').length*50)
                'text-valign' : 'center'
                'font-size' : '60'
                'color' : 'white'
                'text-outline-color' : 'black'
                'text-outline-width' : '2px'
                'content' : 'data(id)'
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
        .selector(':parent')
            .style({
                'background-image' : 'resources/background-circle.svg'
                'background-opacity' : '0'
                'background-width' : '100%'
                'background-height' : '100%'
                'shape' : 'rectangle'
                'border-color' : 'white'
            })

