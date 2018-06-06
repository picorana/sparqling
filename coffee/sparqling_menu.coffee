# define the behaviour of the menu buttons located over the query canvas
class window.PainlessMenu

    constructor: (context) ->
        @context = context
        @init()


    change_size: (query_canvas_size) =>
        @context.sidenav.query_canvas.style.height = query_canvas_size + "%"
        sparql_textbox.style.height = (100 - 10 - query_canvas_size) + "%"
        setTimeout => 
            @context.graph.cy.resize()
        , 550


    create_div: (innerHTML = null, className = null, id = null, onclick = null, tooltip = null) ->
        div             = document.createElement('div')
        div.innerHTML   = innerHTML
        div.className   = className + ' tooltip'
        div.id          = id
        div.onclick     = onclick

        if tooltip != null
            span                = document.createElement('span')
            span.innerHTML      = tooltip
            span.className      = 'tooltiptext'
            span.style.display  = 'none'
            div.append(span)

            div.onmouseover     = () => span.style.display = 'block'
            div.onmouseout      = () => span.style.display = 'none'
        
        return div


    create_navigation_div: =>
        nav_div = @create_div(null, null, 'nav_div')

        nav_div.append(@create_div('▲', 'resize_button', null, ( => @change_size(90)), 'expand graph'))
        nav_div.append(@create_div('≡', 'resize_button', null, ( => @change_size(60)), 'center'))
        nav_div.append(@create_div('▼', 'resize_button', null, ( => @change_size(0)), 'expand sparql'))

        return nav_div
        

    init: =>
        menu = @create_div(null, null, 'painless_menu')
        
        document.getElementById('sidenav').append(menu)

        menu.append(@create_navigation_div())

        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">undo</i>',                 'menu_button', null, ( => @context.graph.undo()), 'undo'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">filter_center_focus</i>',  'menu_button', null, ( => @context.graph.center_view()), 'center view'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">file_copy</i>',            'menu_button', null, ( => @context.graph.copy_to_clipboard()), 'copy to clipboard'))
        #menu.append(@create_div('<i class="material-icons" style="font-size: 18px">save</i>',                 'menu_button', null, ( => @context.graph.download()), 'export'))
        #menu.append(@create_div('<i class="material-icons" style="font-size: 18px">open_in_browser</i>',      'menu_button', null, ( => @context.graph.load()), 'import'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">clear_all</i>',            'menu_button', null, ( => @context.graph.clear_all()), 'clear all'))

