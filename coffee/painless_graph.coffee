#_require cyto_style.coffee

class window.PainlessGraph

    
    palette = null
    select_boxes = ['x0']
    cur_variable_value = 0


    constructor: (canvas) ->
        @canvas = canvas # can't understand scope of this
        palette = window.palette('sol-accent', 8)
        @cur_char_code = 66 # better char codes?
        @init()
        @reshape()
        @update_sparql_text()


    reshape: =>
        @cy.nodes().layout({name: 'circle'}).run()


    create_highlighting_box: (node) =>
        ###* creates a box in the sparql text that helps locate in the graph where the node is ###
        st = document.createElement('div')
        st.className = "highlighting_box"
        st.setAttribute('draggable', true)
        st.addEventListener('dragstart',
            (ev) ->
                ev.dataTransfer.setData("text", ev.target.id);
        )
        st.onmouseover = ($) ->
            node.addClass("highlight")
        st.onclick = ($) ->
            node.select()
        st.onmouseout = ($) ->
            node.removeClass("highlight")
        st.innerHTML = node.id()
        st.style.backgroundColor = node.data('color')
        return st


    update_sparql_text: =>

        sparql_text = document.getElementById("sparql_textbox")
        sparql_text.innerHTML = ""

        init_string = document.createElement('div')
        init_string.className = "init_string"

        s_line = document.createElement('div')
        s_line.className = "s_line"


        if select_boxes.length == 0
            s_line.innerHTML = "*"
        else
            for elem in select_boxes
                nbsp = document.createElement('div')
                nbsp.addEventListener('dragover'
                    (ev) ->
                        console.log ev
                        ev.preventDefault()
                )
                nbsp.addEventListener('drop'
                    (ev) ->
                        ev.preventDefault()
                        data = ev.dataTransfer.getData("text");
                        #ev.target.appendChild(document.getElementById(data));
                )
                nbsp.innerHTML = '&nbsp;'
                console.log nbsp
                s_line.append(nbsp)
                s_line.append(@create_highlighting_box(@cy.getElementById(elem)))
   
        select_div = document.createElement('div')
        select_div.innerHTML = "Select "
        init_string.append(select_div)

        init_string.append(s_line)
        init_string.append(document.createElement('br'))

        select_div_f = document.createElement('div')
        select_div_f.innerHTML =  " where {"
        init_string.append(select_div_f)
        
        sparql_text.append(init_string)
       
        q_line = document.createElement('div')
        q_line.className = "q_line"
        for node1 in @cy.nodes(".node-variable")

            for node2 in node1.neighborhood(".node-concept")
                q_line.append(@create_highlighting_box(node1))
                f = document.createElement("div")
                f.innerHTML = ("&nbsp;rdf:type " + node2.id() + " .")
                q_line.append(f)
                q_line.append(document.createElement('br'))

            for node2 in node1.neighborhood(".node-domain")
                for node3 in node2.neighborhood(".node-attribute")
                    for node4 in node3.neighborhood(".node-range")
                        for node5 in node4.neighborhood(".node-variable")
                            
                            q_line.append(@create_highlighting_box(node5))
                            
                            nbsp = document.createElement('div')
                            nbsp.innerHTML = '&nbsp;'
                            q_line.append(nbsp)
                            
                            q_line.append(@create_highlighting_box(node3))

                            nbsp = document.createElement('div')
                            nbsp.innerHTML = '&nbsp'
                            q_line.append(nbsp)

                            q_line.append(@create_highlighting_box(node1))
                            
                            f = document.createElement("div")
                            f.innerHTML = " ."
                            q_line.append(f)
                            q_line.append(document.createElement('br'))
        
        sparql_text.append(q_line)

        f_string = document.createElement('div')
        f_string.innerHTML = '}'
        sparql_text.append(f_string)


    add_link: (link_name, link_type) =>

        cur_variable_value += 1

        parent = @cy.nodes(":selected")
        range_id = parent.id() + Math.round(Math.random()*1000)
        attr_id = link_name
        dom_id = parent.id() + range_id + "d"
        var_id = "x" + cur_variable_value
        
        if link_type == "concept"
            @cy.add({
                group: 'nodes'
                data: {id: attr_id}
                classes: 'node-concept'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: parent.id()
                    target: attr_id
                }
            })

        else

            @cy.add({
                group: 'nodes'
                data: {id: range_id}
                classes: 'node-range'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: parent.id()
                    target: range_id
                }
            })
            @cy.add({
                group: 'nodes'
                data: {id: attr_id}
                classes: 'node-attribute'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: range_id
                    target: attr_id
                }
            })
            @cy.add({
                group: 'nodes'
                data: {id: dom_id}
                classes: 'node-domain'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: attr_id
                    target: dom_id
                }}
            )

            @cy.add({
                group: 'nodes'
                data: {
                    id: var_id
                    color: '#' + palette[cur_variable_value % palette.length];
                }
                classes: 'node-variable'
            })

            select_boxes.push(var_id)

            @cy.add({
                group: 'edges'
                data: {
                    source: dom_id
                    target: var_id
                }
            })

        @update_sparql_text()
        @reshape()
    
    
    init: =>

        menu = document.createElement('div')
        menu.id = 'painless_menu'
        menu.style.backgroundColor = '#555'
        document.getElementById('sidenav').append(menu)

        button = document.createElement('button')
        button.innerHTML = 'undo'
        button.className = 'menu_button'
        button.onclick = () -> console.log 'undo'
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'delete node'
        button.className = 'menu_button'
        button.onclick = () -> console.log 'delete node'
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'reverse relationship'
        button.className = 'menu_button'
        menu.append(button)

        button = document.createElement('button')
        button.innerHTML = 'rename'
        button.className = 'menu_button'
        menu.append(button)

        @cy = new cytoscape(
            container: document.getElementById("query_canvas"),
            style: generate_style()
        )

        @cy.add({
            group: 'nodes'
            data: {
                id: 'x0'
                color: '#' + palette[cur_variable_value % palette.length];
                }
            classes: 'node-variable'
        })

        @cy.on('click', '.node-variable',
            (event) =>
                event.target.select()
                @reshape()
            )
        
        @cy.resize()
