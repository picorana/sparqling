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


    add_selected_node_to_sidenav: ->
        side_nav = document.getElementById("sidenav");
        new_node_div = document.createElement("div");
        new_node_div.innerHTML = @cy.$(":selected").data("label");
        side_nav.append(new_node_div);


    onkeypress_handler : (event) =>
        if event.key == "a" 
            @open_nav()
        else if event.key == "b"
            @close_nav()
        else if event.key == "c"
            @painless_graph.add_role(@cy.nodes(":selected").data('label'))


    add_event_listener : ->
        document.onkeypress = @onkeypress_handler

    
