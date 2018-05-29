class window.Sparqling

    instance = null

    @graph = null
    cur_sidenav_size = 50

    tappedBefore = null
    tappedTimeout = null
 

    constructor: (graph) ->
        if instance
            return instance
        else    
            @graphol_cy = graph.cy
            @cy = @graphol_cy
            @init()
            instance = this


    init : ->
        @create_sidenav()
        @sparql_text    = @graph.sparql_text
        @menu           = new window.PainlessMenu(this)
        @add_event_listener()


    add_to_query: =>
        ###* Adds the selected node in grapholscape to the query ###

        selected_node = @graphol_cy.nodes(":selected")
        
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

        @side_nav_container = document.createElement("div")
        @side_nav_container.id = "sidenav_container"
        @side_nav_container.style.width = (cur_sidenav_size*document.documentElement.clientWidth/100 + 40) + "px"

        document.body.appendChild(@side_nav_container)

        if document.getElementById('zoom_tools') != undefined and document.getElementById('zoom_tools') != null
            document.getElementById('zoom_tools').style.right = (cur_sidenav_size*document.documentElement.clientWidth/100 + 50) + "px"
            document.getElementById('zoom_tools').style.transitionDuration = '0.1s'
        if document.getElementById('cy') != undefined and document.getElementById('cy') != null
            document.getElementById('cy').style.width = ((100-cur_sidenav_size)*document.documentElement.clientWidth/100 + 50) + "px"


        @graphol_cy.resize()

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
            @resize_navbar()
            
        slider.appendChild(slider_button)

        slider_button = document.createElement('div')
        slider_button.innerHTML = '<i class="material-icons">keyboard_arrow_right</i>'
        slider_button.className = 'slider_button'
        slider_button.onclick = () =>
            cur_sidenav_size = cur_sidenav_size - 25
            @resize_navbar()

        slider.appendChild(slider_button)

        button = document.createElement("div")
        button.innerHTML = '<i class="material-icons">add</i><p style="font-size:xx-small; margin-top: -5px">node</p>';
        button.className = "slider_button"
        button.style.bottom = 0;
        button.style.position = 'fixed'
        button.style.marginLeft = '5px'
        button.onclick = () => @add_to_query()
        slider.appendChild(button);

        @side_nav = document.createElement("div");
        @side_nav.id = "sidenav";
        @side_nav.className = "sidenav";
        @side_nav.style.display = 'inline-block'
        @side_nav.style.width = cur_sidenav_size + '%'
        @side_nav_container.appendChild(@side_nav);

        sparql_textbox = document.createElement("div");
        sparql_textbox.id = "sparql_textbox";
        sparql_textbox.innerHTML = "sparql_query_here";
        @side_nav.appendChild(sparql_textbox);

        @query_canvas = document.createElement("div");
        @query_canvas.id = "query_canvas";
        @side_nav.appendChild(@query_canvas)

        @graph = new PainlessGraph(this)

        @resize_navbar()


    resize_navbar: =>

        client_width    = document.documentElement.clientWidth

        center_button   = document.getElementById('center_button')
        zoom_tools      = document.getElementById('zoom_tools')
        owl_translator  = document.getElementById('owl_translator')
        explorer        = document.getElementById('explorer')
        details         = document.getElementById('details')

        if center_button != undefined and center_button != null
            center_button.style.right = (cur_sidenav_size * client_width / 100 + 50) + "px"
            center_button.style.transitionDuration = '0.1s'

        if zoom_tools != undefined and zoom_tools != null
            zoom_tools.style.right = (cur_sidenav_size*document.documentElement.clientWidth/100 + 50) + "px"
            zoom_tools.style.transitionDuration = '0.1s'
        
        if document.getElementById('cy') != undefined and document.getElementById('cy') != null
            document.getElementById('cy').style.width = ((100 - cur_sidenav_size) * client_width /100 + 50) + "px"

        if owl_translator != undefined and owl_translator != null
            owl_translator.style.transitionDuration = '0.1s'
            owl_translator.style.left = (100 - cur_sidenav_size)/2 + "%"
            if cur_sidenav_size > 50
                owl_translator.style.display = 'none'
            else 
                owl_translator.style.display = 'block'

        if explorer != undefined and explorer != null
            explorer.style.transitionDuration = '0.1s'
            explorer.style.left = (100 - cur_sidenav_size)/2 + "%"
            if cur_sidenav_size > 50
                explorer.style.display = 'none'
            else 
                explorer.style.display = 'block'

        if details != undefined and details != null
            details.style.right = (cur_sidenav_size * client_width / 100 + 60) + "px"
            details.style.transitionDuration = '0.1s'
            if cur_sidenav_size > 25
                details.style.display = 'none'
            else 
                details.style.display = 'block'

        @graphol_cy.resize()
    
        if cur_sidenav_size != 100
            @side_nav_container.style.width = (cur_sidenav_size * client_width / 100 + 30) + "px"
            @side_nav.style.width = cur_sidenav_size + '%'
        else 
            @side_nav_container.style.width = (cur_sidenav_size * client_width / 100) + "px"
            @side_nav.style.width =  (cur_sidenav_size * client_width / 100 - 30) + "px"

        setTimeout(()=> 
            @graph.cy.resize()
        , 150)


    onkeypress_handler : (event) =>
        if event.key == "d"
            console.log @graph.cy.nodes(":selected").data('links')

        else if event.keyCode == 46 or event.keyCode == 8 or event.keyCode == 127
            for link in @graph.cy.nodes(":selected").data('links')
                link.delete()


    add_event_listener : ->
        document.onkeypress = @onkeypress_handler
        window.addEventListener('resize', () => @resize_navbar())

        @graphol_cy.on('tap', 
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

    
