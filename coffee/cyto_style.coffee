generate_style = ->
    return new cytoscape.stylesheet()
        .selector('node')
            .style({
                'background-color' : 'black',
                'shape' : 'rectangle'
                'content' : 'data(id)'
            })
        .selector('.node-domain')
            .style({
                'background-color' : 'white'
                'border-color' : 'black'
                'border-style' : 'solid'
                'border-width' : '2px'
            })
        .selector('.node-range')
            .style({
                'background-color' : 'black'
                'border-color' : 'white'
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
            })
        .selector('.node-variable')
            .style({
                'shape' : 'ellipse'
                'background-color' : 'gray'
                'width' : '500' 
                'height' : '500'
                'text-valign' : 'center'
                'font-size' : '60'
                'color' : 'white'
                'text-outline-color' : 'black'
                'text-outline-width' : '2px'
            })
        .selector('node.highlight')
            .style({
                'border-color' : '#333'
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

