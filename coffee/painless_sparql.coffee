class window.PainlessSparql

    
    constructor: (graph) ->
        @graph = graph
        @cy = graph.cy
        
        this.init()


    init : ->
        this.create_sidenav()
        this.add_event_listener()


    create_sidenav : ->
        side_nav = document.createElement("div");
        side_nav.id = "sidenav";
        side_nav.className = "sidenav";
        side_nav.style.cssText = "height: 100%; width: 0%; position: fixed; z-index: 1; top: 0; right: 0; background-color: #111; overflow-x: hidden; padding-top: 60px; transition: 0.5s;";
        document.body.appendChild(side_nav);

        sparql_textbox = document.createElement("div");
        sparql_textbox.id = "sparql_textbox";
        sparql_textbox.innerHTML = "sparql_query_here";
        sparql_textbox.style.cssText = "color: blue";
        side_nav.appendChild(sparql_textbox);

        @query_canvas = document.createElement("canvas");
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
            @add_selected_node_to_sidenav()


    add_event_listener : ->
        document.onkeypress = @onkeypress_handler

    
