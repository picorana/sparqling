class window.PainlessSparql

    painless_graph = null

    
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
            side_nav.style.width = (100 - this.value - 2) + "%"
        document.body.appendChild(slider)

        sparql_textbox = document.createElement("div");
        sparql_textbox.id = "sparql_textbox";
        sparql_textbox.innerHTML = "sparql_query_here";
        side_nav.appendChild(sparql_textbox);

        @query_canvas = document.createElement("div");
        @query_canvas.id = "query_canvas";
        side_nav.appendChild(@query_canvas)

        painless_graph = new PainlessGraph(@query_canvas)

        menu = document.createElement('div')
        menu.id = 'painless_menu'
        document.getElementById('sidenav').append(menu)

        nav_div = document.createElement('div')
        nav_div.id = 'nav_div'

        up_button = document.createElement('div')
        up_button.innerHTML = '▲'
        up_button.className = 'resize_button'
        up_button.onclick = ($) ->
            query_canvas.style.height = '80%'
            sparql_textbox.style.height = '0%'
            query_canvas.style.height = '80%'
        nav_div.append(up_button)

        mid_button = document.createElement('div')
        mid_button.innerHTML = '≡'
        mid_button.className = 'resize_button'
        mid_button.onclick = ($) ->
            query_canvas.style.height = '50%'
            sparql_textbox.style.height = '30%'
        nav_div.append(mid_button)

        down_button = document.createElement('div')
        down_button.innerHTML = '▼'
        down_button.className = 'resize_button'
        down_button.onclick = ($) ->
            sparql_textbox.style.height = '80%'
            query_canvas.style.height = '0%'
        nav_div.append(down_button)

        menu.append(nav_div)

        button = document.createElement('button')
        button.innerHTML = 'undo'
        button.className = 'menu_button'
        button.onclick = ($) => painless_graph.undo()
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'delete node'
        button.className = 'menu_button'
        button.onclick = () -> painless_graph.delete_node()
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'reverse relationship'
        button.className = 'menu_button'
        button.onclick = () ->
            painless_graph.reverse_relationship()
            painless_graph.sparql_text.update()
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'rename'
        button.className = 'menu_button'
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'center view'
        button.onclick = () -> painless_graph.center_view()
        button.className = 'menu_button'
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'copy to clipboard'
        button.className = 'menu_button'
        button.onclick = () -> painless_graph.copy_to_clipboard()
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'add to select'
        button.className = 'menu_button'
        button.onclick = () -> painless_graph.add_to_select(painless_graph.cy.nodes(':selected').id()) 
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'filter'
        button.onclick = () -> 
            painless_graph.sparql_text.add_filter(painless_graph.cy.nodes(':selected').id())
        button.className = 'menu_button'
        menu.append(button)

    open_nav : -> 
        document.getElementById("sidenav").style.width = "50%";


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
                when "role"         then painless_graph.add_link(selected_node.data('label'), 'role')
                when "attribute"    then painless_graph.add_link(selected_node.data('label'), 'attribute')
                when "concept"      then painless_graph.add_link(selected_node.data('label'), 'concept')
        
        else if event.key == "d"
            console.log @cy.nodes(":selected").data('type')


    add_event_listener : ->
        document.onkeypress = @onkeypress_handler

    
