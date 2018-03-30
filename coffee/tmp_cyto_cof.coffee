
sparql_text = document.getElementById("sparql_text")

# possible types:
# node-domain
# node-range
# node-attribute
# node-role

elements = {
    # to be removed in final version
    nodes: [
        {data: {id: 'a'}},
    ]
}

cy = new cytoscape(
    container: document.getElementById('cy'),
    elements: elements
    layout: {name: 'cose'}
    style: new cytoscape.stylesheet()
        .selector('node')
            .style({
                'background-color' : 'black',
                'shape' : 'rectangle'
                'content' : 'data(id)'
            })
        .selector('.node-domain')
            .style({
                'background-color' : 'white'
                'border-color' : 'black'
                'border-style' : 'solid'
                'border-width' : '2px'
            })
        .selector('.node-range')
            .style({
                'background-color' : 'black'
                'border-color' : 'white'
                'border-style' : 'solid'
                'border-width' : '2px'
            })
        .selector('.node-attribute')
            .style({
                'shape' : 'ellipse'
                'background-color' : 'white'
                'border-style' : 'solid'
                'border-color' : 'black'
                'border-width' : '2px'  
            }) 
        .selector(':parent')
            .style({
                'background-image' : 'resources/background-circle.svg'
                'background-opacity' : '0'
                'background-width' : '100%'
                'background-height' : '100%'
                'shape' : 'rectangle'
                'border-color' : 'white'
            })
)

reshape = ->
    parents = cy.nodes().parents()
    parents.layout({name:'circle'}).run()
    for parent in parents
        #parent.position({x:Math.random()*1000, y:Math.random()*1000})
        #console.log 'x: ' + parent.position('x')
        #console.log parent.position('y')
        parent.children().layout({name:'circle'}).run()
        for child in parent.children()
            for neighbor in child.neighborhood('node')
                neighbor.position('x', child.position('x') + (child.position('x') - parent.position('x')))
                neighbor.position('y', child.position('y') + (child.position('y') - parent.position('y')))
                for neighbor2 in neighbor.neighborhood('node')
                    if neighbor2 != child
                        #console.log neighbor2.id()
                        neighbor2.position('x', neighbor.position('x') + (neighbor.position('x')-child.position('x')))
                        neighbor2.position('y', neighbor.position('y') + (neighbor.position('y')-child.position('y')))
                        if neighbor2.isOrphan()
                            console.log neighbor2.id()
                            par_name = neighbor2.id() + 'p'
                            #cy.add({
                                #group: 'nodes'
                                #data: {id: par_name}
                                #position: {x: neighbor2.position('x'), 'y': neighbor2.position('y')}
                            #})
                            #neighbor2.move({parent: par_name})
                        #neighbor2.parent().position('x', neighbor.position('x') + (neighbor.position('x')-child.position('x')))
                        #neighbor2.parent().position('y', neighbor.position('y') + (neighbor.position('y')-child.position('y')))

randomize = (parent_name) ->
    range = Math.round(Math.random() * (10 - 4) + 4)
    console.log "number of generated nodes: " + range
    for i in [0...range - 1] by 1
        new_node_range_id = parent_name + Math.round(Math.random()*10000) + "r"
        new_node_domain_id = parent_name + Math.round(Math.random()*10000) + "d"
        new_node_attribute_id = parent_name + Math.round(Math.random()*10000) + "a"
        new_node_new_parent_id = parent_name + i
        cy.add({
            group: 'nodes'
            data: {id: new_node_range_id, parent: parent_name}
            classes: 'node-range'
        })
        cy.add({
            group: 'nodes'
            data: {id: new_node_attribute_id}
            classes: 'node-attribute'
        })
        #cy.add({
            #group: 'nodes'
            #data: {id: new_node_new_parent_id}
        #})
        cy.add({
            group: 'nodes'
            data: {id: new_node_domain_id, parent: new_node_new_parent_id}
            classes: 'node-domain'
        })
        cy.add({
            group: 'edges'
            data: {
                source: new_node_range_id,
                target: new_node_attribute_id
            }
        })
        cy.add({
            group: 'edges'
            data: {
                source: new_node_attribute_id
                target: new_node_domain_id
            }
        })
        reshape()

add_role = (parent) ->
    range_id = parent.id() + Math.round(Math.random()*1000)
    attr_id = parent.id() + range_id + "a"
    dom_id = parent.id() + range_id + "d"
    var_id = parent.id() + range_id + "p"
    cy.add({
        group: 'nodes'
        data: {id: range_id, parent:parent.id()}
    })
    cy.add({
        group: 'nodes'
        data: {id: attr_id}
        classes: 'node-attribute'
    })
    cy.add({
        group: 'edges'
        data: {
            source: range_id
            target: attr_id
        }
    })
    cy.add({
        group: 'nodes'
        data: {id: dom_id}
        classes: 'node-domain'
    })
    cy.add({
        group: 'edges'
        data: {
            source: attr_id
            target: dom_id
        }}
    )
    cy.nodes().layout({name:'concentric'}).run()

cy.on('click', 'node',
    ($) -> 
        if this.isOrphan()
            add_role(this)
            reshape()
)

cy.on('mousemove',
    ($) ->
        sparql_string = "Select * <br> where { <br>"
        
        for parent in cy.nodes().parents()
            for child in parent.children()
                sparql_string += "&emsp;$" + parent.id() + " " + child.id() + "<br>"    

        sparql_text.innerHTML = sparql_string + "}"
)

#randomize('a')
reshape()
