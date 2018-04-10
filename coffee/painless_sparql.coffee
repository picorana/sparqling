class window.PainlessSparql

    
    constructor: (graph) ->
        @graph = graph
        @cy = graph.cy
        
        this.init()


    init : ->
        this.create_sidenav()
        this.add_event_listener()


    create_sidenav : =>
        side_nav = document.createElement("div");
        side_nav.id = "sidenav";
        side_nav.className = "sidenav";
        document.body.appendChild(side_nav);

        sparql_textbox = document.createElement("div");
        sparql_textbox.id = "sparql_textbox";
        sparql_textbox.innerHTML = "sparql_query_here";
        side_nav.appendChild(sparql_textbox);

        @query_canvas = document.createElement("div");
        @query_canvas.id = "query_canvas";
        side_nav.appendChild(@query_canvas);

        @painless_graph = new PainlessGraph(@query_canvas)


    open_nav : -> 
        document.getElementById("sidenav").style.width = "500px";


    close_nav : ->
        document.getElementById("sidenav").style.width = "0px";


    onkeypress_handler : (event) =>
        if event.key == "a" 
            @open_nav()
        
        else if event.key == "b"
            @close_nav()
        
        else if event.key == "c" # to be activated by a button
            
            selected_node = @cy.nodes(":selected")
            
            if selected_node.length == 0
                console.warn "please, select a node in the main graph"
            
            switch selected_node.data('type')
                when "role"         then @painless_graph.add_link(selected_node.data('label'), 'role')
                when "attribute"    then @painless_graph.add_link(selected_node.data('label'), 'attribute')
                when "concept"      then @painless_graph.add_link(selected_node.data('label'), 'concept')
        
        else if event.key == "d"
            console.log @cy.nodes(":selected").data('type')


    add_event_listener : ->
        document.onkeypress = @onkeypress_handler

    
