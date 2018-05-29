class window.QueryFilter


    constructor: (sparql_text, node) ->
        
        @node1 = node
        @node2 = null

        @v1_val = null
        @v2_val = null

        @datatype = "^^xsd:string"
        @operator_sym = ">="

        @sparql_text = sparql_text

        @conditions = []
        @conditions.push(@new_condition())

        @slots = []


    new_condition: () =>

        @slots = []

        if @node1 != undefined and @node1 != null
            @node1.addClass('filtered')
        if @node2 != undefined and @node2 != null
            @node2.addClass('filtered')

        d = document.createElement('div')
        d.style.display = 'flex'
        if @node1 != undefined and @node1 != null
            hl_box = new window.HlBox(@node1)
            d.appendChild(hl_box.to_html())
            @slots.push(hl_box)
        else
            @v = new window.Void(@, 0, @v1_val)
            @v.div.addEventListener('input', ()=> 
                console.log @v.div.innerHTML
                @v1_val = @v.div.innerHTML
                @v.val = @v.div.innerHTML
                )
            d.appendChild(@v.to_html())
            @slots.push(@v)

        operator = document.createElement('div')
        operator.innerHTML = @operator_sym
        operator.style.marginLeft = '5px'
        operator.style.marginRight = '5px'
        operator.contentEditable = 'true'
        operator.addEventListener('input', ()=> @operator_sym = operator.innerHTML)

        d.appendChild(operator)

        if @node2 != undefined and @node2 != null
            hl_box = new window.HlBox(@node2)
            d.appendChild(hl_box.to_html())
            @slots.push(hl_box)
        else
            @v = new window.Void(@, 1, @v2_val)
            @v.div.addEventListener('input', ()=> 
                @v2_val = @v.div.innerHTML
                @v.val = @v.div.innerHTML
                )
            d.appendChild(@v.to_html())
            @slots.push(@v)

        value = document.createElement('div')
        value.style.marginLeft = '5px'
        value.style.marginRight = '5px'
        value.innerHTML = @datatype
        value.contentEditable = 'true'
        value.addEventListener('input', ()=> @datatype = value.innerHTML)

        d.appendChild(value)

        return d


    to_string: =>
        result = 'filter ('
        if @slots[0] instanceof HlBox
            if @node1 != undefined and @node1 != null
                result += ' ' + @node1.id()
        else if @v1_val != null
            result += @v1_val
        else return ''

        if @operator_sym != undefined and @operator_sym != null
            result += ' ' + @operator_sym

        if @slots[1] instanceof HlBox
            if @node2 != undefined and @node2 != null
                result += ' ' + @node2.id()
        else if @v2_val != null
            result += @v2_val
        else return ''

        if @datatype != undefined and @datatype != null
            result += ' ' + @datatype

        return result + ' )'


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

        result_div.onmouseover = () ->
            remove_button.style.visibility = 'visible'
        result_div.onmouseout = () ->
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

