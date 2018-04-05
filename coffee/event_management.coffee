
create_highlighting_box = (node) ->
    st = "<div class='highlighting_box' onmouseover=''>" + node.id() + "</div>"
    return st

update_sparql_text = ->
    sparql_string = "Select * <br> where { <br>"
    
    for node1 in cy.nodes(".node-variable")
        for node2 in node1.neighborhood(".node-domain")
            for node3 in node2.neighborhood(".node-attribute")
                for node4 in node3.neighborhood(".node-range")
                    for node5 in node4.neighborhood(".node-variable")
                        sparql_string += "&emsp;$" + create_highlighting_box(node1) +  node2.id() + " " + create_highlighting_box(node5) + "<br>" 

    sparql_text.innerHTML = sparql_string + "}"

