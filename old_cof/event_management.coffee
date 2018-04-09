
create_highlighting_box = (node) ->
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

update_sparql_text = ->
    ###* performs all update functions to the query string ###
    sparql_text.innerHTML = ""
    init_string = document.createElement('div')
    init_string.innerHTML = "Select * <br> where { <br>"
    sparql_text.append(init_string)
   
    q_line = document.createElement('div')
    q_line.className = "q_line"
    for node1 in cy.nodes(".node-variable")
        for node2 in node1.neighborhood(".node-domain")
            for node3 in node2.neighborhood(".node-attribute")
                for node4 in node3.neighborhood(".node-range")
                    for node5 in node4.neighborhood(".node-variable")
                        q_line.append(create_highlighting_box(node5))
                        q_line.append(create_highlighting_box(node3))
                        q_line.append(create_highlighting_box(node1))
                        f = document.createElement("div")
                        f.innerHTML = " ."
                        q_line.append(f)
                        sparql_text.append(q_line)



    f_string = document.createElement('div')
    f_string.innerHTML = '}'
    sparql_text.append(f_string)
