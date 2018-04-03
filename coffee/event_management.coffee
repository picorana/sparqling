update_sparql_text = ->
    sparql_string = "Select * <br> where { <br>"
    
    for parent in cy.nodes(".node-variable")
        for child in parent.neighborhood("node")
            sparql_string += "&emsp;$" + parent.id() + " " + child.id() + "<br>"    

    sparql_text.innerHTML = sparql_string + "}"

