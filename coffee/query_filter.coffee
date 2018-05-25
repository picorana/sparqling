class window.QueryFilter


    constructor: (sparql_text, node) ->
        
        @node1 = node
        @node2 = null

        @sparql_text = sparql_text

        @conditions = []
        @conditions.push(@new_condition())


    new_condition: () =>

        if @node1 != undefined and @node1 != null
            @node1.addClass('filtered')
        if @node2 != undefined and @node2 != null
            @node2.addClass('filtered')

        d = document.createElement('div')
        d.style.display = 'flex'
        if @node1 != undefined and @node1 != null
            hl_box = new window.HlBox(@node1)
            d.appendChild(hl_box.to_html())
        else
            v = new window.Void(@, 0)
            d.appendChild(v.to_html())

        operator = document.createElement('div')
        operator.innerHTML = ">="
        operator.style.marginLeft = '5px'
        operator.style.marginRight = '5px'
        operator.contentEditable = 'true'

        d.appendChild(operator)

        if @node2 != undefined and @node2 != null
            hl_box = new window.HlBox(@node2)
            d.appendChild(hl_box.to_html())
        else
            v = new window.Void(@, 1)
            d.appendChild(v.to_html())

        value = document.createElement('div')
        value.style.marginLeft = '5px'
        value.style.marginRight = '5px'
        value.innerHTML = "^^xsd:string"
        value.contentEditable = 'true'

        d.appendChild(value)

        return d



    to_html: =>
        result_div = document.createElement('div')
        
        start = document.createElement('div')
        start.innerHTML = "filter "
        start.style.display = "inline"
        result_div.append(start)

        conditions_container = document.createElement('div')
        conditions_container.className = "filter_condition_container"
        for condition in @conditions
            conditions_container.appendChild(@new_condition())
        result_div.append(conditions_container)

        remove_button = document.createElement('div')
        remove_button.innerHTML = '❎'
        remove_button.style.color = '#F08080'
        remove_button.style.fontSize = 'large'
        remove_button.style.marginLeft = '8px'
        remove_button.style.visibility = 'hidden'
        remove_button.style.display = 'inline-block'
        remove_button.onclick = () =>
            @delete()
        result_div.append(remove_button)

        result_div.onmouseover = () =>
            remove_button.style.visibility = 'visible'
        result_div.onmouseout = () =>
            remove_button.style.visibility = 'hidden'
            

        return result_div


    delete: =>
        index = @sparql_text.filters.indexOf(@)
        if @node1 != undefined and @node1 != null
            @node1.removeClass('filtered')
        if @node2 != undefined and @node2 != null
            @node2.removeClass('filtered')
        @sparql_text.filters.splice(index, 1)
        @sparql_text.update()

