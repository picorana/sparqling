class window.PainlessSparql

    @graph = null
    cur_sidenav_size = 50

    tappedBefore = null
    tappedTimeout = null
 
    constructor: (graph) ->
        @cy = graph.cy

        @init()


    init : ->
        @create_sidenav()
        @sparql_text = @graph.sparql_text
        @menu = new window.PainlessMenu(this)
        @add_event_listener()


    add_to_query: =>
        selected_node = @cy.nodes(":selected")
        
        if selected_node.length == 0
            console.warn "please, select a node in the main graph"
        
        switch selected_node.data('type')
            when "role"         then @graph.add_link(selected_node.data('label'), 'role')
            when "attribute"    then @graph.add_link(selected_node.data('label'), 'attribute', @extract_datatype(selected_node))
            when "concept"      then @graph.add_link(selected_node.data('label'), 'concept')


    extract_datatype: (inode) =>
        for neighbor in inode.neighborhood('node')
            if neighbor.data('type') == "range-restriction"
                for node in neighbor.neighborhood('node')
                    if node.data('type') == "value-domain"
                        return node.data('label')


    create_sidenav : =>

        side_nav_container = document.createElement("div")
        side_nav_container.id = "sidenav_container"
        side_nav_container.style.width = (cur_sidenav_size*document.documentElement.clientWidth/100 + 30) + "px"

        document.body.appendChild(side_nav_container)

        slider = document.createElement("div")
        slider.style.backgroundColor = '#93a1a1'
        slider.style.height = '100%'
        slider.id = 'slider'
        slider.style.width = '100%'
        slider.style.display = 'inline-block'
        sidenav_container.appendChild(slider)

        slider_button = document.createElement('div')
        slider_button.innerHTML = '<i class="material-icons">keyboard_arrow_left</i>'
        slider_button.className = 'slider_button'
        slider_button.onclick = () =>
            cur_sidenav_size = cur_sidenav_size + 25
        
            if cur_sidenav_size != 100
                side_nav_container.style.width = (cur_sidenav_size*document.documentElement.clientWidth/100 + 30) + "px"
                side_nav.style.width = cur_sidenav_size + '%'
            else 
                side_nav_container.style.width = (cur_sidenav_size*document.documentElement.clientWidth/100) + "px"
                side_nav.style.width =  (cur_sidenav_size*document.documentElement.clientWidth/100 - 30) + "px"
            setTimeout(()=> 
                @graph.cy.resize()
            , 550)
        slider.appendChild(slider_button)

        slider_button = document.createElement('div')
        slider_button.innerHTML = '<i class="material-icons">keyboard_arrow_right</i>'
        slider_button.className = 'slider_button'
        slider_button.onclick = () =>
            cur_sidenav_size = cur_sidenav_size - 25
            side_nav_container.style.width = (cur_sidenav_size*document.documentElement.clientWidth/100 + 30) + "px"
            side_nav.style.width = (cur_sidenav_size) + '%'
            setTimeout(()=> 
                @graph.cy.resize()
            , 550)
        slider.appendChild(slider_button)

        button = document.createElement("div")
        button.innerHTML = '<i class="material-icons">add</i><p style="font-size:xx-small; margin-top: -5px">node</p>';
        button.className = "slider_button"
        button.style.bottom = 0;
        button.style.position = 'fixed'
        button.style.marginLeft = '5px'
        button.onclick = () => @add_to_query()
        slider.appendChild(button);

        side_nav = document.createElement("div");
        side_nav.id = "sidenav";
        side_nav.className = "sidenav";
        side_nav.style.display = 'inline-block'
        side_nav.style.width = cur_sidenav_size + '%'
        side_nav_container.appendChild(side_nav);

        sparql_textbox = document.createElement("div");
        sparql_textbox.id = "sparql_textbox";
        sparql_textbox.innerHTML = "sparql_query_here";
        side_nav.appendChild(sparql_textbox);

        @query_canvas = document.createElement("div");
        @query_canvas.id = "query_canvas";
        side_nav.appendChild(@query_canvas)

        @graph = new PainlessGraph(@query_canvas)

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
            console.log @graph.cy.nodes(":selected").data('links')

        else if event.key == "l"
            @graph.layout_index += 1
            @graph.reshape()
            console.log @graph.layout

        else if event.keyCode == 46 or event.keyCode == 8 or event.keyCode == 127
            for link in @graph.cy.nodes(":selected").data('links')
                link.delete()


    add_event_listener : ->
        document.onkeypress = @onkeypress_handler

        @cy.on('tap', 
            (event) => 
                tappedNow = event.target;
                if tappedTimeout && tappedBefore 
                    clearTimeout(tappedTimeout);
              
                if tappedBefore == tappedNow 
                    tappedNow.trigger('doubleTap', event);
                    tappedBefore = null;
                    originalTapEvent = null;
                    @add_to_query()
                else 
                    tappedTimeout = setTimeout(()=>  
                            tappedBefore = null
                        , 300);
                    tappedBefore = tappedNow;
            )

    
