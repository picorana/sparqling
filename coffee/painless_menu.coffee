class window.PainlessMenu

    constructor: (context) ->
        @context = context
        @init()


    change_size: (query_canvas_size) =>
        @context.query_canvas.style.height = query_canvas_size + "%"
        sparql_textbox.style.height = (100 - 10 - query_canvas_size) + "%"
        setTimeout => 
            @context.graph.cy.resize()
        , 550


    create_div: (innerHTML = null, className = null, id = null, onclick = null) ->
        div             = document.createElement('div')
        div.innerHTML   = innerHTML
        div.className   = className
        div.id          = id
        div.onclick     = onclick
        
        return div


    create_navigation_div: =>
        nav_div = @create_div(null, null, 'nav_div')

        nav_div.append(@create_div('▲', 'resize_button', null, => @change_size(90)))
        nav_div.append(@create_div('≡', 'resize_button', null, => @change_size(60)))
        nav_div.append(@create_div('▼', 'resize_button', null, => @change_size(0)))

        return nav_div
        

    init: =>
        menu = @create_div(null, null, 'painless_menu')
        
        document.getElementById('sidenav').append(menu)

        menu.append(@create_navigation_div())

        menu.append(@create_div('<i class="material-icons">undo</i>',                 'menu_button', null, => @context.graph.undo()))
        menu.append(@create_div('<i class="material-icons">filter_center_focus</i>',  'menu_button', null, => @context.graph.center_view()))
        menu.append(@create_div('<i class="material-icons">file_copy</i>',            'menu_button', null, => @context.graph.copy_to_clipboard()))
        menu.append(@create_div('<i class="material-icons">save</i>',                 'menu_button', null, => @context.graph.download()))
        menu.append(@create_div('<i class="material-icons">open_in_browser</i>',      'menu_button', null, => @context.graph.load()))
        menu.append(@create_div('<i class="material-icons">clear_all</i>',            'menu_button', null, => @context.graph.clear_all()))

