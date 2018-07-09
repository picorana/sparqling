# define the behaviour of the menu buttons located over the query canvas
class window.SparqlingMenu

    constructor: (context) ->
        @context = context
        @init()
        @change_size(50)


    change_size: (query_canvas_size) =>
        clientHeight = document.getElementById('cy').clientHeight
        query_canvas_pixels = (query_canvas_size) * clientHeight / 100
        @context.sidenav.query_canvas.style.height =  query_canvas_pixels + "px"
        sparql_textbox.style.height = Math.max((clientHeight - 100 - query_canvas_pixels), 0) + "px"
        setTimeout =>
            @context.graph.cy.resize()
        , 550


    create_div: (innerHTML = null, className = null, id = null, onclick = null, tooltip = null) ->
        div             = document.createElement('div')
        div.innerHTML   = innerHTML
        div.className   = className + ' grapholscape-tooltip'
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

        nav_div.append(@create_div('▲', 'sparqling_resize_button', null, ( => @change_size(90)), 'expand graph'))
        nav_div.append(@create_div('≡', 'sparqling_resize_button', null, ( => @change_size(50)), 'center'))
        nav_div.append(@create_div('▼', 'sparqling_resize_button', null, ( => @change_size(10)), 'expand sparql'))

        return nav_div


    set_invisible: ->
      for elem in document.getElementsByClassName('sparqling_menu_button')
        elem.style.display = 'none'
      for elem in document.getElementsByClassName('sparqling_resize_button')
        elem.style.display = 'none'

    set_visible: ->
      for elem in document.getElementsByClassName('sparqling_menu_button')
        elem.style.display = 'inline-block'
      for elem in document.getElementsByClassName('sparqling_resize_button')
        elem.style.display = 'inline-block'


    init: =>
        menu = @create_div(null, null, 'painless_menu')
        menu.append(@create_navigation_div())
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">undo</i>',
                                'sparqling_menu_button', null,
                                ( => @context.graph.undo()),
                                'undo'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">play_arrow</i>',
                                'sparqling_menu_button', null,
                                ( =>
                                    @context.storage.setItem('SPARQLING_QUERY', @context.graph.sparql_text.generate_plaintext_query())
                                    window.location = "/queryanswering"),
                                'run query'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">filter_center_focus</i>',
                                'sparqling_menu_button', null,
                                ( => @context.graph.center_view()),
                                'center view'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">file_copy</i>',
                                'sparqling_menu_button', null,
                                ( =>
                                    @context.graph.copy_to_clipboard()
                                    @context.alert.say('Query copied to clipboard!', SparqlingAlert::Level.INFO)),
                                'copy to clipboard'))
        #menu.append(@create_div('<i class="material-icons" style="font-size: 18px">save</i>',
        #                        'sparqling_menu_button', null,
        #                        ( => @context.graph.download()),
        #                        'export'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">open_in_browser</i>',
                                'sparqling_menu_button', null,
                                ( =>
                                    # Create a temporary input element and click it to trigger the open file dialog
                                    input_field = document.createElement('input')
                                    input_field.type = 'file'
                                    input_field.onchange = ((change_event) =>
                                        # Consider only the first file if multiple are selected from the user
                                        if change_event.target.files.length > 0
                                            file = change_event.target.files[0]
                                            file_reader = new FileReader
                                            file_reader.onload = ((event) =>
                                                b64_encoded_content = event.target.result
                                                b64_content_start_idx = b64_encoded_content.indexOf(',') + 1
                                                # Returned data is formatted as <mime-type>,<b64-encoded-content>,
                                                # so we extract only the content (if any)
                                                if b64_content_start_idx > 0
                                                    b64_decoded_content = atob(b64_encoded_content.substring(b64_content_start_idx))
                                                    @context.loader.load(b64_decoded_content))
                                            # Finally trigger the data read
                                            file_reader.readAsDataURL(file))
                                    # Trigger the input field click
                                    input_field.click()),
                                'import'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">clear_all</i>',
                                'sparqling_menu_button', null,
                                ( => @context.graph.clear_all()),
                                'clear all'))

        document.getElementById('sidenav').append(menu)