#_require query_filter.coffee

class window.SparqlText

    instance = null

    select_boxes        = []

    div_sparql_text     = null
    cy                  = null
    links               = null


    constructor: (cy, links) ->
        if instance
            return instance
        else
            div_sparql_text = document.getElementById('sparql_textbox')
            div_sparql_text.className = "unselectable"
            @div_sparql_text = div_sparql_text

            @select_boxes = select_boxes

            @cy      = cy
            @links   = links
            @filters = []

            instance = this


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
            @cy.center(node)
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
                    @update()

        st.onmouseover = ($) ->
            node.addClass("highlight")
        st.onmouseout = ($) ->
            node.removeClass("highlight")
        st.onclick = ($) =>
            @cy.nodes().unselect()
            node.select()
        st.innerHTML = node.data('label')
        st.style.backgroundColor = node.data('color')

        container.append(st)

        minicross = document.createElement('div')
        minicross.innerHTML = ' x '
        minicross.className = 'minicross'
        minicross.dataset.linkedhbox = st.id
        minicross.dataset.node_id = st.dataset.node_id
        minicross.style.visibility = 'hidden'
        minicross.onclick = ($) =>
            console.log 'a'
            @remove_from_select_boxes(minicross.dataset.node_id)
        container.append(minicross)
        container.onmouseover = ($) ->
            minicross.style.visibility = 'visible'
        container.onmouseout = ($) ->
            minicross.style.visibility = 'hidden'

        return container


    remove_from_select_boxes: (node_id) =>
        console.log @select_boxes
        @select_boxes = @select_boxes.filter((elem) -> return elem != node_id)
        @update()


    generate_plaintext_query: =>
        result = "Select "
        if select_boxes.length == 0
            result += '*'
        else for elem in select_boxes
            result += '?' + elem + ' '
        result += '\r\nwhere {'
        for link in @links
            result += '\r\n'
            result += link.to_string()
        for filter in @filters
            result += '\r\n'
            result += filter.to_string()
        result += '\r\n}'
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


    add_filter: (node) =>
        @filters.push(new window.QueryFilter(@, node))
        @update()


    update: =>
        div_sparql_text.innerHTML = ""

        init_string = document.createElement('div')
        init_string.className = "init_string"

        s_line = document.createElement('div')
        s_line.className = "s_line"


        if @select_boxes.length == 0
            s_line.innerHTML = "&nbsp;*"
        else
            s_line.append(@create_tab())

            count = 0
            for elem in @select_boxes
                if @cy.getElementById(elem).id() != undefined
                    s_line.append(@create_highlighting_box(@cy.getElementById(elem)))
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

        for link in @links
            query_line = new window.QueryLine(link, this)
            div_sparql_text.append(query_line.to_html())

        for filter in @filters
            div_sparql_text.append(filter.to_html())

        f_string = document.createElement('div')
        f_string.style.display = 'inline-block'
        f_string.style.marginRight = '5px'
        f_string.innerHTML = '} '
        div_sparql_text.append(f_string)

        filter_button = document.createElement('div')
        filter_button.className = 'filter_button'
        filter_button.innerHTML = '+ filter'
        filter_button.onclick = () => @add_filter()
        div_sparql_text.append(filter_button)

        containers = Array.prototype.slice.call(document.getElementsByClassName('q_line'))
            .concat(Array.prototype.slice.call(document.getElementsByClassName('void_box')))
            .concat(s_line)

        drake = dragula({
            containers: containers
            copy: (el, source) =>
                if source.classList.contains('q_line')
                    return true
                else return false
            accepts: (el, target, source) ->
                if target.classList.contains('q_line') and source.classList.contains('q_line')
                    return false
                if target.classList.contains('void_box')
                    target.innerHTML.replace('&nbsp;', '')
                return true
            invalid: (el, handle) ->
                if el.classList.contains('highlighting_box') or el.classList.contains('highlighting_box_container')
                    return false
                else return true
                })

        drake.on('drop',
            (el, target) =>
                if target.classList.contains('void_box')
                    if target.dataset.filter_position == '0'
                        $(target).data('parent').node1 = @cy.getElementById(el.firstChild.dataset.node_id)
                        $(target).data('parent').conditions = []
                        $(target).data('parent').conditions.push($(target).data('parent').new_condition())
                    else if target.dataset.filter_position == '1'
                        $(target).data('parent').node2 = @cy.getElementById(el.firstChild.dataset.node_id)
                        $(target).data('parent').conditions = []
                        $(target).data('parent').conditions.push($(target).data('parent').new_condition())

                @select_boxes = []
                for child in s_line.children
                    if child.firstChild.innerHTML != undefined
                        @select_boxes.push(child.firstChild.innerHTML.substr(1))
                @update()
            )
