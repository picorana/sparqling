#_require cyto_style.coffee
#_require sparql_text.coffee
#_require painless_link.coffee 

class window.SparqlingGraph
    ###* manages the graph visualization
        TODO: hardcoded collision distance should be in constants
    ###

    state_buffer    = null

    constructor: (context) ->
        ###*
        TODO: sparql_text should be managed by painless_sparql.coffee
        ###

        @utils = new window.PainlessUtils()
        @context = context

        @links = []

        @layout_names   = ['cola', 'cose-bilkent', 'circle', 'cose', 'grid', 'breadthfirst', 'concentric']
        @layout_index   = 0

        @init()
        @reshape()
       
        @sparql_text = new SparqlText(@cy, @links)
        @sparql_text.update()

        new window.PainlessContextMenu(@cy, this)

        

    reshape: =>
        ###* resets node positions in the graph view ###

        @layout = @layout_names[@layout_index % @layout_names.length]
        @cy.layout({
            name: @layout
            fit: false
            animate: true
            nodeDimensionsIncludeLabels: true
            #padding: 
            edgeLength: 200
        }).run()


    download: => 
        data = JSON.stringify(@cy.json())
        filename = "sparql.json"
        type = "text/plain"
        file = new Blob([data], {type: type});
        if window.navigator.msSaveOrOpenBlob
            window.navigator.msSaveOrOpenBlob(file, filename);
        else
            a = document.createElement("a")
            url = URL.createObjectURL(file)
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            setTimeout(
                () -> 
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url) 
            , 0); 
        

    clear_all: =>
        for link in @links
            try link.delete()
            catch e then console.log link

        @cy.remove(@cy.nodes())
        @cy.remove(@cy.edges())

        @links = []

        @sparql_text.filters = []
        @sparql_text.update()


    center_view: (ele = null) =>
        ###* 
        TODO: pan and center should actually be two different buttons!
        ###

        if ele == null
            if @cy.nodes(':selected').length > 0
                @cy.center(@cy.nodes(':selected'))
            else @cy.fit()
        else
            @cy.center(ele)


    add_to_select: (node_id) =>
        @sparql_text.add_to_select(node_id)

    
    copy_to_clipboard: ->
        @sparql_text.copy_to_clipboard()


    save_state: ->
        if state_buffer == null
            state_buffer = []
        if @cy.json() != state_buffer[state_buffer.length - 1]
            state_buffer.push(@cy.json())
        if state_buffer.length >= state_buffer_max_length 
           state_buffer.shift() 


    undo : ->
        if state_buffer == null or state_buffer.length < 1
            @context.alert "no saved states"
        else
            @cy.json(state_buffer[state_buffer.length - 1])
            @cy.style(@utils.generate_style())
            state_buffer.pop()
            @reshape()


    reverse_relationship: =>
        s_node = @cy.nodes(":selected")
        if s_node == null
            console.warn 'please select a node in the sparql graph'
        else if s_node.hasClass("node-variable")
            console.warn 'please select a role and not a variable'
        else if s_node.data('links').link_type == 'attribute' 
            console.warn 'attributes cannot be reversed'
        else if s_node.hasClass("node-role") or s_node.hasClass("node-domain") or s_node.hasClass("node-range")
            @cy.nodes(":selected").data('links').reverse()
        else console.warn 'this action cannot be performed on the selected node'



    merge: (node1, node2) ->
        ###* merges node1 and node2, repositioning all node2's edges into node1 ###
        # node2 è il nodo che viene trascinato

        @save_state()

        links_to_add = []

        for link in node2.data('links')

            if link.link_type == 'concept'
                links_to_add.push(new PainlessLink(this, @cy, link.link_name, link.link_type, node_var1 = node1))

            else if link.node_var1.id() == node2.id() and link.node_var2.id() == node2.id()
                console.log 'case1'
                links_to_add.push(new PainlessLink(this, @cy, link.link_name, link.link_type, node_var1 = node1, node_var2 = node1))
            else if link.node_var1.id() == node2.id()
                console.log 'case2'
                links_to_add.push(new PainlessLink(this, @cy, link.link_name, link.link_type, node_var1 = node1, node_var2 = link.node_var2))
            else 
                console.log 'case3'
                links_to_add.push(new PainlessLink(this, @cy, link.link_name, link.link_type, node_var1 = link.node_var1, node_var2 = node1))

            link.delete()

        for link in links_to_add
            @links.push(link)

        @cy.remove(node2) 
        @sparql_text.update()


    add_link: (link_name, link_type, datatype) =>
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

        for node in @context.graphol_cy.nodes()
            if node.data('label') == link_name
                node.style('border-color', '#e38400')
                node.style('border-width', '5px')

        @save_state()
        if link_type == 'concept'
            if @cy.nodes(":selected").length > 0 and @cy.nodes(":selected").hasClass('node-variable')
                link = new PainlessLink(this, @cy, link_name, link_type, @cy.nodes(":selected"))
            else
                link = new PainlessLink(this, @cy, link_name, link_type)
                @sparql_text.add_to_select(link.node_var1.id())
        else
            if @cy.nodes(":selected").length > 0 and @cy.nodes(":selected").hasClass('node-variable')
                ###* if a var node is selected, the link is added to the var node and one new var node is created###
                link = new PainlessLink(this, @cy, link_name, link_type, @cy.nodes(":selected"), null, datatype)
                @sparql_text.add_to_select(link.node_var2.id())
            else 
                ###* otherwise, two new var nodes are created ###
                link = new PainlessLink(this, @cy, link_name, link_type, null, null, datatype)
                @sparql_text.add_to_select(link.node_var1.id())
                @sparql_text.add_to_select(link.node_var2.id())

        @links.push(link)
        console.log @links
        @sparql_text.update()
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
 
    load: =>
        
        parsed_query = window.sparqljs.Parser().parse(
            'PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX xmlns: <http://baa> ' +
            'SELECT * { ?mickey foaf:name "Mickey Mouse" . ?mickey foaf:knows ?other. }');

        for triple in parsed_query['where'][0]['triples']

            if @cy.getElementById(triple['subject'].slice(1)).length == 0

                subj = @cy.add({ 
                    group: 'nodes'
                    classes: 'node-variable'
                    data: {
                        id: triple['subject'].slice(1)
                        label: triple['subject'].slice(1)
                        color: '#' + palette[0]
                        links: []
                    }
                })

                subj = subj[0]

            else 

                subj = @cy.getElementById(triple['subject'].slice(1))

            if triple['object'].charAt(0) == '?'

                if @cy.getElementById(triple['object'].slice(1)).length == 0

                    obj = @cy.add({ 
                        group: 'nodes'
                        classes: 'node-variable'
                        data: {
                            id: triple['object'].slice(1)
                            label: triple['object'].slice(1)
                            color: '#aaa'
                            links: []
                        }
                    })

                    obj = obj[0]

                else

                    obj = @cy.getElementById(triple['object'].slice(1))

            else 

                obj = @cy.add({ 
                    group: 'nodes'
                    classes: 'node-constant-value'
                    data: {
                        id: triple['object']
                        label: triple['object']
                        color: '#aaa'
                        links: []
                    }
                })

                obj = obj[0]


            $.each(parsed_query['prefixes'], (elem) => 
                console.log triple['predicate'].indexOf(parsed_query['prefixes'][elem])
                if triple['predicate'].indexOf(parsed_query['prefixes'][elem]) != -1
                    triple['predicate'] = triple['predicate'].substr(parsed_query['prefixes'][elem].length)
                    )



            link = new PainlessLink(this, @cy, triple['predicate'], 'role', subj, obj)
            @links.push(link)

            @reshape()
            @sparql_text.update()



    
    init: =>

        @cy = new cytoscape(
            container: document.getElementById("query_canvas"),
            style: @utils.generate_style()
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
