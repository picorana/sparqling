#_require constants.coffee

class window.PainlessLink

    cy          = null

    node_var1   = null
    node_var2   = null
    node_quad1  = null
    node_quad2  = null
    node_link   = null

    link_name   = null
    link_type   = null


    constructor: (cy, link_name, link_type, node_var1 = null, node_var2 = null) ->
        @cy         = cy

        @link_name  = link_name
        @link_type  = link_type

        @node_var1  = node_var1
        @node_var2  = node_var2

        @create()


    find_new_name: ->
        x = 0
        while @cy.getElementById("x" + x).length != 0 
            x += 1
        return "x" + x


    create_edge: (node1, node2) =>
        return @cy.add({
            group: 'edges'
            data: {source: node1.id(), target: node2.id()}
        })

    
    create_node: (type, label = null) =>
        
        data = {}

        if type == 'node-variable' and label == null 
            label = @find_new_name()
            data['id'] = label
            data['color'] = '#' + palette[label.substr(1) % palette.length]
        
        data['label'] = label

        return @cy.add({
            group: 'nodes'
            data: data
            classes: type
        })


    create: =>
        if @node_var1 == null
            @node_var1   = @create_node('node-variable')
        if @node_var2 == null
            @node_var2   = @create_node('node-variable')

        @node_quad1      = @create_node('node-range')
        @node_quad2      = @create_node('node-domain')

        @node_link       = @create_node('node-link', @link_name)
        @create_edge(@node_var2, @node_quad2)
        @create_edge(@node_quad1, @node_link)
        @create_edge(@node_link, @node_quad2)
        @create_edge(@node_var1, @node_quad1)
        

            



