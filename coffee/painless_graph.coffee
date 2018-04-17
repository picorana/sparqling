#_require cyto_style.coffee
#_require sparql_text.coffee
#_require painless_link.coffee 

class window.PainlessGraph
    ###* manages the graph visualization
        TODO: palette should be in constants
        TODO: hardcoded collision distance should be in constants
    ###
    
    cur_variable_value = 0
    sparql_text = null
    state_buffer = null
    state_buffer_max_length = 20


    constructor: ->
        ###*
        TODO: sparql_text should be managed by painless_sparql.coffee
        ###
        @init()
        @reshape()
        
        sparql_text = new SparqlText(@cy)
        sparql_text.update()


    reshape: =>
        ###* resets node positions in the graph view 
            TODO: it's ugly.
        ###
        if @cy.nodes('.node-variable').length < 3
            @cy.layout({
                name: 'circle'
            }).run()
        else
            @cy.layout({
                name:'breadthfirst'
                padding: 5
                spacingFactor: 1 
                fit:false
            }).run()


    center_view: =>
        ###* 
        TODO: pan and center should actually be two different buttons!
        ###
        if @cy.nodes(':selected').length > 0
            @cy.center(@cy.nodes(':selected'))
        else @cy.fit()


    add_to_select: (node_id) =>
        sparql_text.add_to_select(node_id)

    
    copy_to_clipboard: ->
        sparql_text.copy_to_clipboard()


    save_state: ->
        if state_buffer == null
            state_buffer = []
        if @cy.json() != state_buffer[state_buffer.length - 1]
            state_buffer.push(@cy.json())
        if state_buffer.length >= state_buffer_max_length 
           state_buffer.shift() 


    undo : ->
        if state_buffer == null or state_buffer.length < 1
            console.warn "no saved states"
        else
            @cy.json(state_buffer[state_buffer.length - 1])
            @cy.style(generate_style())
            state_buffer.pop()
            @reshape()


    cleanup_unlinked_variables: =>
        for node in @cy.nodes('.node-variable')
            if node.neighborhood('node').length == 0
                @cy.remove(node)
                sparql_text.remove_from_select_boxes(node.id())


    delete_node: =>
        @save_state()

        for node in @cy.nodes(':selected')
            if node.hasClass('node-variable')
                for node2 in node.neighborhood('node')
                    for node3 in node2.neighborhood('node')
                        for node4 in node3.neighborhood('node')
                            @cy.remove(node4)
                        @cy.remove(node3)
                    @cy.remove(node2) 
                @cy.remove(node)
                sparql_text.remove_from_select_boxes(node.id())
            if node.hasClass('node-attribute')
                for node2 in node.neighborhood('node')
                    @cy.remove(node2)
                @cy.remove(node)
        
        @cleanup_unlinked_variables()
        @reshape()


    merge: (node1, node2) ->
        ###* merges node1 and node2, repositioning all node2's edges into node1 ###
        @save_state()

        for edge in node2.neighborhood('edge')
        
            # if this edge has node2 as target
            if edge.target().id() == node2.id()
                @cy.add({
                    group: 'edges'
                    data: {
                        source: edge.source().id()
                        target: node1.id()
                    }
                })

            # if this edge has node2 as source
            if edge.source().id() == node2.id()
                @cy.add({
                    group: 'edges'
                    data: {
                        source: node1.id()
                        target: edge.target().id()
                    }
                })

        # remove node2 with all its connected edges
        sparql_text.remove_from_select_boxes(node2.id())
        @cy.remove(node2) 


    add_link: (link_name, link_type) =>
        ###* adds a new link in the graph. 
            links that are not concepts (roles and attributes) add a new variable into the graph.
            links are always added to the selected variable in the graph, if there are no selected variables,   
                two new variables are created.

            links can be:
            - concepts   
            - roles
            - attributes

            TODO: use an enum to represent link types instead of hardcoded strings
        ###
        @save_state()

        ###* if a var node is selected, the link is added to the var node and one new var node is created###
        if @cy.nodes(":selected").length > 0 and @cy.nodes(":selected").hasClass('node-variable')
            link = new PainlessLink(@cy, link_name, link_type, @cy.nodes(":selected"))
            sparql_text.add_to_select(link.node_var2.id())
        else ###* otherwise, two new var nodes are created ###
            link = new PainlessLink(@cy, link_name, link_type)
            sparql_text.add_to_select(link.node_var1.id())
            sparql_text.add_to_select(link.node_var2.id())

        sparql_text.update()
        @reshape()
   

    compute_distance: (node1, node2) ->
        ###* computes distance between two node positions ###
        a = Math.abs(node1.position('x') - node2.position('x'))
        b = Math.abs(node1.position('y') - node2.position('y'))
        return Math.sqrt(a*a + b*b)


    check_collisions: =>
        ###* check if there are any collisions in all the node variables
        returns the colliding nodes if there are any.

        TODO: collision highlight is broken!
        TODO: remove hardcoded collision distance threshold
        ###
        for node in @cy.nodes(".node-variable")
            for node2 in @cy.nodes(".node-variable")
                if node != node2
                    if @compute_distance(node, node2) < 100
                        node.addClass('highlight')
                        node2.addClass('highlight')
                        return [node, node2]
                    else
                        node.removeClass('highlight')
 
    
    init: =>
        @cy = new cytoscape(
            container: document.getElementById("query_canvas"),
            style: generate_style()
            wheelSensitivity: 0.5
        )

        @cy.on('click', '.node-variable',
            (event) =>
                event.target.select()
                @reshape()
            )

        @cy.on('mouseup',
            ($) => 
                if @check_collisions() != undefined
                    node_tmp_arr = @check_collisions()
                    @merge(node_tmp_arr[0], node_tmp_arr[1])
            
                @reshape()
            )
        @cy.resize()
