#_require cyto_style.coffee
#_require sparql_text.coffee

class window.PainlessGraph

    
    palette = null
    sparql_text = null
    cur_variable_value = 0


    constructor: ->
        palette = window.palette('sol-accent', 8)
 
        @init()
        @reshape()
        
        sparql_text = new SparqlText(@cy)
        sparql_text.update()


    reshape: =>
        @cy.nodes().layout({name: 'circle'}).run()


    add_link: (link_name, link_type) =>

        cur_variable_value += 1

        parent = @cy.nodes(":selected")
        range_id = parent.id() + Math.round(Math.random()*1000)
        attr_id = link_name
        dom_id = parent.id() + range_id + "d"
        var_id = "x" + cur_variable_value
        
        if link_type == "concept"
            @cy.add({
                group: 'nodes'
                data: {id: attr_id}
                classes: 'node-concept'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: parent.id()
                    target: attr_id
                }
            })

        else

            @cy.add({
                group: 'nodes'
                data: {id: range_id}
                classes: 'node-range'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: parent.id()
                    target: range_id
                }
            })
            @cy.add({
                group: 'nodes'
                data: {id: attr_id}
                classes: 'node-attribute'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: range_id
                    target: attr_id
                }
            })
            @cy.add({
                group: 'nodes'
                data: {id: dom_id}
                classes: 'node-domain'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: attr_id
                    target: dom_id
                }}
            )

            @cy.add({
                group: 'nodes'
                data: {
                    id: var_id
                    color: '#' + palette[cur_variable_value % palette.length];
                }
                classes: 'node-variable'
            })

            sparql_text.add_to_select(var_id)

            @cy.add({
                group: 'edges'
                data: {
                    source: dom_id
                    target: var_id
                }
            })

        sparql_text.update()
        @reshape()
    
    
    init: =>

        @cy = new cytoscape(
            container: document.getElementById("query_canvas"),
            style: generate_style()
        )

        @cy.add({
            group: 'nodes'
            data: {
                id: 'x0'
                color: '#' + palette[cur_variable_value % palette.length];
                }
            classes: 'node-variable'
        })

        @cy.on('click', '.node-variable',
            (event) =>
                event.target.select()
                @reshape()
            )
        
        @cy.resize()
