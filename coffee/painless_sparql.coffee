class window.PainlessSparql

    @graph = null
   
 
    constructor: (graph) ->
        @graph = graph
        @cy = graph.cy
        
        @init()


    init : ->
        @create_sidenav()
        @menu = new window.PainlessMenu(this) 

    add_to_query: =>
        console.log "hey"
        selected_node = @cy.nodes(":selected")
        
        if selected_node.length == 0
            console.warn "please, select a node in the main graph"
        
        switch selected_node.data('type')
            when "role"         then @graph.add_link(selected_node.data('label'), 'role')
            when "attribute"    then @graph.add_link(selected_node.data('label'), 'attribute')
            when "concept"      then @graph.add_link(selected_node.data('label'), 'concept')

    create_sidenav : =>

        side_nav_container = document.createElement("div")
        side_nav_container.id = "sidenav_container"
        document.body.appendChild(side_nav_container)

        side_nav = document.createElement("div");
        side_nav.id = "sidenav";
        side_nav.className = "sidenav";
        side_nav_container.appendChild(side_nav);

        button = document.createElement("button")
        button.innerHTML = "add to \n\r query";
        button.id = "add_to_query_button"
        button.onclick = () => @add_to_query()
        side_nav.appendChild(button);

        sparql_textbox = document.createElement("div");
        sparql_textbox.id = "sparql_textbox";
        sparql_textbox.innerHTML = "sparql_query_here";
        side_nav.appendChild(sparql_textbox);

        @query_canvas = document.createElement("div");
        @query_canvas.id = "query_canvas";
        side_nav.appendChild(@query_canvas)

        @graph = new PainlessGraph(@query_canvas)


        slider = document.createElement("div")
        slider.className = "slidecontainer"
        slider_range = document.createElement("input")
        slider_range.type = "range"
        slider_range.min = 1
        slider_range.max = 100
        slider_range.value = 48
        slider_range.step = 0.5
        slider_range.className = 'slider'
        slider.appendChild(slider_range)
        slider_range.oninput = (s) ->
            console.log this.getBoundingClientRect()
            side_nav.style.width = (document.documentElement.clientWidth * (100-this.value))/100 + "px"
            setTimeout(()=> 
                @graph.cy.resize()
            , 550)
        document.body.appendChild(slider)
    

    open_nav : -> 
        document.getElementById("sidenav").style.width = "50%";


    close_nav : ->
        document.getElementById("sidenav").style.width = "0px";


    onkeypress_handler : (event) =>
        if event.key == "a" 
            #@open_nav()
        
        else if event.key == "b"
            #@close_nav()
        
        else if event.key == "d"
            console.log @cy.nodes(":selected").data('type')


    add_event_listener : ->
        document.onkeypress = @onkeypress_handler

    
