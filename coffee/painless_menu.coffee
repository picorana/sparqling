class window.PainlessMenu

    constructor: (context) ->
        @context = context
        @init()


    change_size: (query_canvas_size) =>
        @context.query_canvas.style.height = query_canvas_size + "%"
        sparql_textbox.style.height = (100 - 20 - query_canvas_size) + "%"
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

        nav_div.append(@create_div('▲', 'resize_button', null, => @change_size(80)))
        nav_div.append(@create_div('≡', 'resize_button', null, => @change_size(50)))
        nav_div.append(@create_div('▼', 'resize_button', null, => @change_size(50)))

        return nav_div
        

    init: =>

        menu = @create_div(null, null, 'painless_menu')
        
        document.getElementById('sidenav').append(menu)

        menu.append(@create_navigation_div())

        menu.append(@create_div('undo',                 'menu_button', null, => @context.graph.undo()))
        menu.append(@create_div('delete_node',          'menu_button', null, => @context.graph.delete_node()))
        menu.append(@create_div('reverse_relationship', 'menu_button', null, => @context.graph.reverse_relationship()))
        menu.append(@create_div('rename',               'menu_button', null, ###* TODO !! ###))
        menu.append(@create_div('center view',          'menu_button', null, => @context.graph.center_view()))
        menu.append(@create_div('copy to clipboard',    'menu_button', null, => @context.graph.copy_to_clipboard()))
        menu.append(@create_div('add to select',        'menu_button', null, 
            => @context.graph.add_to_select(@context.graph.cy.nodes(':selected').id()) ))
        menu.append(@create_div('filter',               'menu_button', null, 
            => @context.graph.sparql_text.add_filter(@context.graph.cy.nodes(':selected').id()) ))
