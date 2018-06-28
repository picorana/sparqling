class window.SparqlingNavbar

    cur_sidenav_size = 50

    constructor: (context) ->
        @context = context
        @create_sidenav()


    create_sidenav : =>

        @side_nav_container = document.createElement("div")
        @side_nav_container.id = "sidenav_container"

        @grapholscape_container = document.getElementById("grapholscape-container")
        @grapholscape_container.appendChild(@side_nav_container)

        @context.graphol_cy.resize()

        slider = document.createElement("div")
        slider.id = 'slider'
        sidenav_container.appendChild(slider)

        slider_button = document.createElement('div')
        slider_button.innerHTML = '<i class="material-icons">keyboard_arrow_left</i>'
        slider_button.className = 'slider_button'
        slider_button.onclick = () =>
            @resize_navbar(cur_sidenav_size + 25)

        slider.appendChild(slider_button)

        slider_button = document.createElement('div')
        slider_button.innerHTML = '<i class="material-icons">keyboard_arrow_right</i>'
        slider_button.className = 'slider_button'
        slider_button.onclick = () =>
            @resize_navbar(cur_sidenav_size - 25)

        slider.appendChild(slider_button)

        button = document.createElement("div")
        button.innerHTML = '<i class="material-icons">add</i><p style="font-size:xx-small; margin-top: -5px">query</p>';
        button.className = "slider_button_down"
        button.onclick = () => @context.add_to_query()
        slider.appendChild(button);

        @side_nav = document.createElement("div");
        @side_nav.id = "sidenav";
        @side_nav.style.width = cur_sidenav_size + '%'
        @side_nav_container.appendChild(@side_nav);

        sparql_textbox = document.createElement("div");
        sparql_textbox.id = "sparql_textbox";
        sparql_textbox.innerHTML = "sparql_query_here";
        @side_nav.appendChild(sparql_textbox);

        @query_canvas = document.createElement("div");
        @query_canvas.id = "query_canvas";
        @side_nav.appendChild(@query_canvas)

        @resize_navbar()


    resize_navbar: (new_size = cur_sidenav_size) =>

        cur_sidenav_size = new_size

        if cur_sidenav_size < 0
          cur_sidenav_size = 0
        if cur_sidenav_size > 75
          cur_sidenav_size = 75

        client_width    = @grapholscape_container.clientWidth

        center_button   = document.getElementById('center_button')
        zoom_tools      = document.getElementById('zoom_tools')
        owl_translator  = document.getElementById('owl_translator')
        explorer        = document.getElementById('explorer')
        details         = document.getElementById('details')
        fullscreen      = document.getElementById('grapholscape-fullscreen-btn')

        if center_button != undefined and center_button != null
            center_button.style.right = (cur_sidenav_size * client_width / 100 + 50) + "px"
            center_button.style.transitionDuration = '0.1s'

        if zoom_tools != undefined and zoom_tools != null
            zoom_tools.style.right = (cur_sidenav_size * client_width / 100 + 50) + "px"
            zoom_tools.style.transitionDuration = '0.1s'

        if document.getElementById('cy') != undefined and document.getElementById('cy') != null
            document.getElementById('cy').style.width = ((100 - cur_sidenav_size) * client_width / 100 + 50) + "px"

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

        if fullscreen != undefined and fullscreen != null
            fullscreen.style.right = (cur_sidenav_size * client_width / 100 + 50) + "px"
            fullscreen.style.transitionDuration = '0.1s'

        if cur_sidenav_size != 100
            @side_nav_container.style.width = (cur_sidenav_size * client_width / 100 + 30) + "px"
            @side_nav.style.width =  (cur_sidenav_size * client_width / 100) + "px"
        else
            @side_nav_container.style.width = (cur_sidenav_size * client_width / 100) + "px"
            @side_nav.style.width =  (cur_sidenav_size * client_width / 100 - 30) + "px"

        if cur_sidenav_size == 0
          @context.menu.set_invisible()
        else if @context.menu != undefined
          @context.menu.set_visible()

        @context.graphol_cy.resize()
        setTimeout(()=>
            @context.graph.cy.resize()
        , 150)
