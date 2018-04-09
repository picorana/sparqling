#_require cyto_style.coffee

class window.PainlessGraph

    constructor: (canvas) ->
        @canvas = canvas # can't understand scope of this
        @cur_char_code = 66 # better char codes?
        @init()
        @reshape()
        @update_sparql_text()


    reshape: =>
        console.log "reshaping"
        @cy.nodes().layout({name: 'circle'}).run()


    create_highlighting_box: (node) ->
        ###* creates a box in the sparql text that helps locate in the graph where the node is ###
        st = document.createElement('div')
        st.className = "highlighting_box"
        st.onmouseover = ($) ->
            console.log "highlighted: " + node.id()
            node.addClass("highlight")
        st.onclick = ($) ->
            select_node(node)
        st.onmouseout = ($) ->
            console.log "removed highlighting: " + node.id()
            node.removeClass("highlight")
        st.innerHTML = node.id()
        return st


    update_sparql_text: =>

        console.log "updating query"

        sparql_text = document.getElementById("sparql_textbox")
        sparql_text.innerHTML = ""
        init_string = document.createElement('div')
        init_string.innerHTML = "Select * <br> where { <br>"
        sparql_text.append(init_string)
       
        q_line = document.createElement('div')
        q_line.className = "q_line"
        for node1 in @cy.nodes(".node-variable")
            for node2 in node1.neighborhood(".node-domain")
                for node3 in node2.neighborhood(".node-attribute")
                    for node4 in node3.neighborhood(".node-range")
                        for node5 in node4.neighborhood(".node-variable")
                            q_line.append(@create_highlighting_box(node5))
                            q_line.append(@create_highlighting_box(node3))
                            q_line.append(@create_highlighting_box(node1))
                            f = document.createElement("div")
                            f.innerHTML = " ."
                            q_line.append(f)
                            q_line.append(document.createElement('br'))
        sparql_text.append(q_line)

        f_string = document.createElement('div')
        f_string.innerHTML = '}'
        sparql_text.append(f_string)


    add_role: (role_name) =>
        parent = @cy.nodes(":selected")
        range_id = parent.id() + Math.round(Math.random()*1000)
        attr_id = role_name
        dom_id = parent.id() + range_id + "d"
        var_id = String.fromCharCode(@cur_char_code).toLowerCase()

        @cur_char_code += 1
        
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
            data: {id: var_id}
            classes: 'node-variable'
        })
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
        @cy = new cytoscape(
            container: document.getElementById("query_canvas"),
            style: generate_style()
        )

        @cy.add({
            group: 'nodes'
            data: {id: 'a'}
            classes: 'node-variable'
        })

        @cy.on('click', '.node-variable',
            (event) =>
                event.target.select()
                #@add_role(event.target)
                @reshape()
            )
        
        @cy.resize()
