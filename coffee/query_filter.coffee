class window.QueryFilter


    constructor: (node_id) ->
        
        @node_id = node_id
        @conditions = []


    new_condition: () =>
        d = document.createElement('div')
        if @node_id != "undefined"
            member1 = document.createElement('div')
            member1.innerHTML = @node_id
            d.appendChild(member1)
        else
            v = new window.Void
            d.appendChild(v)

        operator = document.createElement('div')
        operator.innerHTML = ">="

        d.appendChild(operator)

        value = document.createElement('div')
        value.innerHTML = "100 ^^xsd:string"

        d.appendChild(value)

        return d



    to_html: =>
        result_div = document.createElement('div')
        
        start = document.createElement('div')
        start.innerHTML = "filter "
        start.style.display = "inline"
        result_div.append(start)

        @conditions.push(@new_condition())

        conditions_container = document.createElement('div')
        conditions_container.className = "filter_condition_container"
        for condition in @conditions
            conditions_container.appendChild(condition)
        result_div.append(conditions_container)
            

        return result_div
