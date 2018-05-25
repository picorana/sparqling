#_require constants.coffee

class window.PainlessLink

    color_index = 0

    constructor: (context, cy, link_name, link_type, node_var1 = null, node_var2 = null, datatype) ->
        @cy         = cy
        @context    = context

        @link_name  = link_name
        @link_type  = link_type

        @node_var1  = node_var1
        @node_var2  = node_var2

        @edge_source = null
        @edge_target = null

        @datatype = datatype
        @datatype_node = null

        if link_type == 'concept'
            @create_concept()
        else
            @create_link()


    find_new_name: (base_name = null) ->
        if base_name == null
            base_name = "x"

        i = 0
        while @cy.getElementById(base_name + i).length != 0 
            i += 1
        return base_name + i


    create_edge: (node1, node2, classes = null) =>
        return @cy.add({
            group: 'edges'
            data: {source: node1.id(), target: node2.id()}
            classes: classes
        })


    reverse: =>
        ###* can only be applied to non-concept relationships ###
        if @source == @node_var1
            @edge_source.classes('target-edge')
            @edge_target.classes('source-edge')
            @source = @node_var2
            @target = @node_var1
        else 
            @edge_source.classes('source-edge')
            @edge_target.classes('target-edge')
            @source = @node_var1
            @target = @node_var2


    add_datatype: (node, datatype) =>
        @datatype_node = @cy.add({
            group: 'nodes'
            data: {
                label: datatype
            }
            classes: 'node-datatype'
        })

        @edge_datatype = @cy.add({
            group: 'edges'
            data: {source: node.id(), target: @datatype_node.id(), weight: 99}
            classes: 'edge-datatype'
        })
   

    create_node: (type, label = null) =>

        data = {}

        if type == 'node-variable' 
            label = @find_new_name(label)
            data['id'] = label
            
            data['color'] = '#' + palette[color_index % palette.length]
            color_index += 1
        
        if type == 'node-concept' 
            data['label'] = @link_name
        else if type == 'node-attribute' or type == 'node-role'
            data['label'] = label
        else data['label'] = '?' + label
        
        data['links'] = [@]

        return @cy.add({
            group: 'nodes'
            data: data
            classes: type
        })


    delete: =>

        index = @context.links.indexOf(this)
        @context.links.splice(index, 1)
        @context.sparql_text.update()

        for node in @context.context.cy.nodes()
            if node.data('label') == @link_name
                node.style('border-color', 'black')
                node.style('border-width', '1px')

        if @node_link != null and @node_link != undefined
            @cy.remove(@node_link)
        if @node_concept != null and @node_concept != undefined
            @cy.remove(@node_concept)
        if @datatype_node != null and @datatype_node != undefined
            @cy.remove(@datatype_node)
        for node_var in [@node_var1, @node_var2]
            if node_var != null and node_var != undefined    

                index = node_var.data('links').indexOf(@)
                node_var.data('links').splice(index, 1)
                if node_var.data('links').length == 0
                    for i in [0 ... @context.sparql_text.select_boxes.length]
                        if @context.sparql_text.select_boxes[i] == node_var.id()
                            @context.sparql_text.select_boxes.splice(i, 1)
                    @cy.remove(node_var)          

        @context.sparql_text.update()


    create_link: =>
        if @node_var1 == null or @node_var1 == undefined
            @node_var1   = @create_node('node-variable')
            @node_var1.classes('node-variable node-variable-full-options')
        else if @node_var1.hasClass('attr-range') 
            console.warn 'properties can\'t be added to the range of an attribute'
            return 
        else @node_var1.data('links').push(@)

        if @node_var2 == null or @node_var2 == undefined
            if @link_type == 'attribute'
                @node_var2   = @create_node('node-variable', @link_name)
                @node_var2.classes('node-variable attr-range')
                if @datatype != null and @datatype != undefined
                    @add_datatype(@node_var2, @datatype)
            else 
                @node_var2 = @create_node('node-variable')
                @node_var2.classes('node-variable node-variable-full-options')
        else @node_var2.data('links').push(@)
       
        @source = @node_var1
        @target = @node_var2

        if @link_type == 'role'
            @node_link       = @create_node('node-role', @link_name)
        else
            @node_link       = @create_node('node-attribute', @link_name)

        @edge_source = @create_edge(@node_link, @source, "source-edge")
        @edge_target = @create_edge(@node_link, @target, "target-edge")

        

    create_concept: =>
        if @node_var1 == null or @node_var1 == undefined
            @node_var1  = @create_node('node-variable')
            @node_var1.classes('node-variable node-variable-full-options')
        else @node_var1.data('links').push(@) 

        @node_concept     = @create_node('node-concept')
        @create_edge(@node_var1, @node_concept, 'edge-concept')
            



