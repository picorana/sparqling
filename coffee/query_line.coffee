class window.QueryLine


    constructor: (link, sparql_text) ->
        @link = link
        console.log @link
        @sparql_text = sparql_text

    
    to_html: =>
        q_line = document.createElement('div')

        if @link.link_type == 'concept'
            q_line.append(@create_highlighting_box(@link.node_var1))
            
            f = document.createElement("div")
            f.innerHTML = ("rdf:type " + @link.node_concept.data('label') + " .")
            
            q_line.append(f)

        else
            q_line.append(@create_highlighting_box(@link.source))
            
            link_div = document.createElement('div')
            link_div.innerHTML = @link.node_link.data('label') + "&nbsp;"
            q_line.append(link_div)
            
            q_line.append(@create_highlighting_box(@link.target))
            f = document.createElement("div")
            f.innerHTML = " ."
            q_line.append(f)

        button_div = document.createElement('div')
        button_div.style.visibility = 'hidden'

        if @link.link_type != 'concept'
            reverse_button = document.createElement('div')
            reverse_button.innerHTML = '🔄'
            reverse_button.style.color = '#ADD8E6'
            reverse_button.style.fontSize = 'large'
            reverse_button.style.marginLeft = '8px'
            reverse_button.style.display = 'inline-block'
            reverse_button.onclick = () =>
                @link.reverse()
                @sparql_text.update()
            button_div.append(reverse_button)

        remove_button = document.createElement('div')
        remove_button.innerHTML = '❎'
        remove_button.style.color = '#F08080'
        remove_button.style.fontSize = 'large'
        remove_button.style.marginLeft = '8px'
        remove_button.style.display = 'inline-block'
        remove_button.onclick = () =>
            @link.delete()
            @sparql_text.update()
        button_div.append(remove_button)

        q_line.append(button_div)
        q_line.onmouseover = () ->
            button_div.style.visibility = 'visible'
        q_line.onmouseout = () ->
            button_div.style.visibility = 'hidden'

        q_line.className = 'q_line'

        return q_line


    create_highlighting_box: (node) =>
        ###* creates a box in the sparql text that helps locate in the graph where the node is ###
        container = document.createElement('div')
        container.className = 'highlighting_box_container'

        st = document.createElement('div')
        st.className = "highlighting_box"
        st.id = node.id() + Math.round(Math.random()*1000)
        st.dataset.prevname = node.id()
        st.dataset.node_id = node.id()
        st.ondblclick = () =>
            st.setAttribute('contenteditable', 'true')
            @sparql_text.cy.center(node)
            setTimeout(() -> 
                st.focus()
            , 0);

            st.onkeydown = (event) =>
                node.data('label', st.innerHTML)

                if event.keyCode == 13
                    event.preventDefault();
                    if st.innerHTML.length <= 2
                        st.innerHTML = node.id()
                    st.setAttribute('contenteditable', 'false')
                    @sparql_text.update()
        st.onmouseover = (jQuery) ->
            node.addClass("highlight")
        st.onmouseout = (jQuery) ->
            node.removeClass("highlight")
        st.onclick = (jQuery) =>
            @sparql_text.cy.nodes().unselect()
            node.select()
        st.innerHTML = node.data('label')
        st.style.backgroundColor = node.data('color')
        
        container.append(st)

        return container
