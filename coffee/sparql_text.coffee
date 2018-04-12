class window.SparqlText


    div_sparql_text = null
    select_boxes = []


    constructor: (cy) ->
       div_sparql_text = document.getElementById('sparql_textbox') 
       @cy = cy


    add_to_select: (id) ->
        select_boxes.push(id)


    create_tab: ->
        nbsp = document.createElement('div')
        nbsp.innerHTML = '&nbsp;'
        return nbsp


    create_highlighting_box: (node) =>
        ###* creates a box in the sparql text that helps locate in the graph where the node is ###
        container = document.createElement('div')
        container.className = 'highlighting_box_container'

        st = document.createElement('div')
        st.className = "highlighting_box"
        st.id = node.id() + Math.round(Math.random()*100)
        st.dataset.node_id = node.id()
        st.setAttribute('draggable', true)
        st.addEventListener('dragstart',
            (ev) ->
                ev.dataTransfer.setData("text", ev.target.id);
        )
        st.onmouseover = ($) ->
            node.addClass("highlight")
        st.onmouseout = ($) ->
            node.removeClass("highlight")
        st.onclick = ($) ->
            node.select()
        st.innerHTML = "?" + node.id()
        st.style.backgroundColor = node.data('color')
        
        container.append(st)

        minicross = document.createElement('div')
        minicross.innerHTML = ' x '
        minicross.className = 'minicross'
        minicross.dataset.linkedhbox = st.id
        minicross.dataset.node_id = st.dataset.node_id
        minicross.style.display = 'none'
        minicross.onclick = ($) =>
            l_index = select_boxes.indexOf(minicross.dataset.node_id)
            console.log l_index
            select_boxes.splice(l_index, 1)
            console.log select_boxes
            @update()
        container.append(minicross)

        container.onmouseover = ($) ->
            minicross.style.display = 'inline-block'
        container.onmouseout = ($) ->
            minicross.style.display = 'none'

        return container


    dragslot_drop: (ev, index) =>
        ev.preventDefault()
        data = ev.dataTransfer.getData("text");
        this_element_id = document.getElementById(data).dataset.node_id
        select_boxes.splice(select_boxes.indexOf(this_element_id), 1)
        console.log index
        select_boxes.splice(index, 0, this_element_id)
        @update()
   

    create_dragslot: (index) =>
        nbsp = document.createElement('div')
        nbsp.className = 'dragslot_select'
        nbsp.dataset.index = index
        
        nbsp.addEventListener('dragover'
            (ev) ->
                ev.preventDefault()
                for ds in document.getElementsByClassName('dragslot_select')
                    ds.style.opacity = 1;
        )

        nbsp.addEventListener('drop'
            (ev) => @dragslot_drop(ev, nbsp.dataset.index))

        nbsp.innerHTML = '&nbsp;&nbsp;'
        return nbsp


    update: =>

        div_sparql_text.innerHTML = ""

        init_string = document.createElement('div')
        init_string.className = "init_string"

        s_line = document.createElement('div')
        s_line.className = "s_line"


        if select_boxes.length == 0
            s_line.innerHTML = "&nbsp;*"
        else

            s_line.append(@create_tab())

            count = 0
            for elem in select_boxes
                s_line.append(@create_highlighting_box(@cy.getElementById(elem)))
                s_line.append(@create_dragslot(count))
                count += 1

        select_div = document.createElement('div')
        select_div.innerHTML = "Select "
        init_string.append(select_div)

        init_string.append(s_line)
        init_string.append(document.createElement('br'))

        select_div_f = document.createElement('div')
        select_div_f.innerHTML =  " where {"
        init_string.append(select_div_f)
        
        div_sparql_text.append(init_string)
       
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
                            
                            q_line.append(@create_tab())
                            
                            q_line.append(@create_highlighting_box(node3))

                            q_line.append(@create_tab())

                            q_line.append(@create_highlighting_box(node1))
                            
                            f = document.createElement("div")
                            f.innerHTML = " ."
                            q_line.append(f)
                            q_line.append(document.createElement('br'))
        
        div_sparql_text.append(q_line)

        f_string = document.createElement('div')
        f_string.innerHTML = '}'
        div_sparql_text.append(f_string)
