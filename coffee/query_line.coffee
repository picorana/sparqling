class window.QueryLine


    constructor: (link, sparql_text) ->
        @link = link
        @sparql_text = sparql_text

    
    to_html: =>
        q_line = document.createElement('div')

        if @link.link_type == 'concept'
            q_line.append(@sparql_text.create_highlighting_box(@link.node_var1))
            f = document.createElement("div")
            f.innerHTML = ("&nbsp;rdf:type " + @link.node_concept.data('label') + " .")
            q_line.append(f)
            q_line.append(document.createElement('br'))

        else
            q_line.append(@sparql_text.create_highlighting_box(@link.source))
            
            link_div = document.createElement('div')
            link_div.innerHTML = @link.node_link.data('label') + "&nbsp;"
            q_line.append(link_div)
            
            q_line.append(@sparql_text.create_highlighting_box(@link.target))
            f = document.createElement("div")
            f.innerHTML = " ."
            q_line.append(f)

        q_line.className = 'q_line'
        return q_line
