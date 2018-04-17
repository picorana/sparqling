class window.SparqlText

    select_boxes        = []
    
    div_sparql_text     = null
    cy                  = null
    links               = null


    constructor: (cy, links) ->
       div_sparql_text = document.getElementById('sparql_textbox')
       div_sparql_text.className = "unselectable" 
   
       @cy      = cy
       @links   = links


    add_to_select: (id) ->
        select_boxes.push(id)
        @update()


    create_tab: ->
        nbsp = document.createElement('div')
        nbsp.innerHTML = '&nbsp;'
        return nbsp


    rename: (st) ->
        node = @cy.getElementById(st.dataset.node_id)
        for i in [0 ... select_boxes.length]
            if select_boxes[i] == st.dataset.prevname
                select_boxes[i] = st.innerHTML.substr(i)
        node.data('label', st.innerHTML.substr(1))
        console.log st.innerHTML


    create_highlighting_box: (node) =>
        ###* creates a box in the sparql text that helps locate in the graph where the node is ###
        container = document.createElement('div')
        container.className = 'highlighting_box_container'

        st = document.createElement('div')
        st.className = "highlighting_box"
        st.id = node.id() + Math.round(Math.random()*1000)
        st.dataset.prevname = node.id()
        st.dataset.node_id = node.id()
        st.setAttribute('draggable', true)
        st.setAttribute('contenteditable', 'true')
        st.addEventListener('dragstart',
            (ev) ->
                ev.dataTransfer.setData("text", ev.target.id);
        )
        st.onkeyup =  () => @rename(st) 
        st.onmouseover = ($) ->
            node.addClass("highlight")
        st.onmouseout = ($) ->
            node.removeClass("highlight")
        st.onclick = ($) =>
            @cy.nodes().unselect()
            node.select()
        st.innerHTML = "?" + node.data('label')
        st.style.backgroundColor = node.data('color')
        
        container.append(st)

        minicross = document.createElement('div')
        minicross.innerHTML = ' x '
        minicross.className = 'minicross'
        minicross.dataset.linkedhbox = st.id
        minicross.dataset.node_id = st.dataset.node_id
        minicross.style.display = 'none'
        minicross.onclick = ($) =>
            @remove_from_select_boxes(minicross.dataset.node_id)
        container.append(minicross)
        container.onmouseover = ($) ->
            minicross.style.display = 'inline-block'
        container.onmouseout = ($) ->
            minicross.style.display = 'none'

        return container


    remove_from_select_boxes: (node_id) =>
        select_boxes = select_boxes.filter((elem) -> return elem != node_id)
        @update()


    generate_plaintext_query: =>
        ###* warning: VERY HACKY ###
        result = "Select "
        if select_boxes.length == 0
            result += '*'
        else for elem in select_boxes
            result += '?' + elem + ' '
        result += '\r\nwhere {'
        for elem in document.getElementsByClassName('q_line')
            result += '\r\n'
            count = 0
            for d in elem.getElementsByClassName('highlighting_box')
                result += d.innerHTML + ' '
                count += 1
                if count%3 == 0
                    result += ' .\r\n'
        result += '}'
        console.log result
        return result


    copy_to_clipboard: =>
        ###* ugly hack to make you able to copy text to clipboard.
        ###
        tmp_div = document.createElement('textarea') 
        tmp_div.value = @generate_plaintext_query()
        tmp_div.id = "tmp_div"
        document.body.appendChild(tmp_div)
        thing = document.getElementById('tmp_div')
        thing.select()
        document.execCommand('Copy')
        tmp_div.style.display = 'none'
        document.body.removeChild(tmp_div)

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

        for link in @links
            if link.link_type == 'concept'
                q_line.append(@create_highlighting_box(link.node_var1))
                f = document.createElement("div")
                f.innerHTML = ("&nbsp;rdf:type " + link.node_concept.data('label') + " .")
                q_line.append(f)
                q_line.append(document.createElement('br'))

            else
                q_line.append(@create_highlighting_box(link.node_var2))
                q_line.append(@create_tab())
                q_line.append(@create_highlighting_box(link.node_link))
                q_line.append(@create_tab())
                q_line.append(@create_highlighting_box(link.node_var1))
                f = document.createElement("div")
                f.innerHTML = " ."
                q_line.append(f)
                q_line.append(document.createElement('br'))
        
        div_sparql_text.append(q_line)

        f_string = document.createElement('div')
        f_string.innerHTML = '}'
        div_sparql_text.append(f_string)
