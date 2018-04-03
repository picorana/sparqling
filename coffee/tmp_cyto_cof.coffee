#_require event_management.coffee
# require cyto_style.coffee

sparql_text = document.getElementById("sparql_text")
class_cur_letter = "a"
state_buffer = null
state_buffer_max_length = 20

# possible types:
# node-domain
# node-range
# node-attribute
# node-role
# node-variable

elements = {
    # to be removed in final version
    nodes: [
        {data: {id: 'a'}, classes: 'node-variable'},
    ]
}

cy = new cytoscape(
    container: document.getElementById('cy'),
    elements: elements
    layout: {name: 'cose'}
    style: generate_style()
)


reshape = -> 

    parents = cy.nodes('.node-variable')
    
    for parent in parents
        
        parent.neighborhood().layout({
                name:'circle'
                boundingBox: {
                    x1: parent.position('x') - parent.width()/2
                    y1: parent.position('x') - parent.height()/2
                    w: parent.width()
                    h: parent.height()
                }
            }).run()

        for child in parent.neighborhood('.node-range')
            for neighbor in child.neighborhood('.node-attribute')
                console.log neighbor.id()
                neighbor.position('x', child.position('x') + (child.position('x') - parent.position('x')))
                neighbor.position('y', child.position('y') + (child.position('y') - parent.position('y')))

                for neighbor2 in neighbor.neighborhood('.node-domain')
                    if neighbor2 != child
                        neighbor2.position('x', neighbor.position('x') + (neighbor.position('x')-child.position('x')))
                        neighbor2.position('y', neighbor.position('y') + (neighbor.position('y')-child.position('y')))

                        for new_var in neighbor2.neighborhood('.node-variable')
                            if new_var != neighbor
                                new_var.position('x', neighbor2.position('x') + (neighbor2.position('x')-neighbor.position('x')))
                                new_var.position('y', neighbor2.position('y') + (neighbor2.position('y')-neighbor.position('y')))


add_role = (parent) ->
    range_id = parent.id() + Math.round(Math.random()*1000)
    attr_id = parent.id() + range_id + "a"
    dom_id = parent.id() + range_id + "d"
    var_id = parent.id() + range_id + "p"
    cy.add({
        group: 'nodes'
        data: {id: range_id}
    })
    cy.add({
        group: 'edges'
        data: {
            source: parent.id()
            target: range_id
        }
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

    # male qui
    reshape()
    class_cur_letter += 1
    
    cy.add({
        group: 'nodes'
        data: {id: class_cur_letter}
        classes: 'node-variable'
    })
    cy.add({
        group: 'edges'
        data: {
            source: dom_id
            target: class_cur_letter
        }
    })


compute_distance = (node1, node2) ->
    a = Math.abs(node1.position('x') - node2.position('x'))
    b = Math.abs(node1.position('y') - node2.position('y'))
    return Math.sqrt(a*a + b*b)


check_collisions = ->
    for node in cy.nodes(".node-variable")
        check = false
        for node2 in cy.nodes(".node-variable")
            if node != node2
                if compute_distance(node, node2) < 500
                    node.addClass('highlight')
                else
                    node.removeClass('highlight')

undo = (state_buffer) ->
    if state_buffer == null or state_buffer.length < 1
        console.log "no saved states"
    else
        cy.json(state_buffer[state_buffer.length - 1])
        state_buffer.pop()

save_state = ->
    # state should actually be saved only when the graph is actually modified !!
    if state_buffer == null
        state_buffer = []
    if cy.json() != state_buffer[state_buffer.length - 1]
        state_buffer.push(cy.json())
    if state_buffer.length >= state_buffer_max_length 
       state_buffer.shift() 

cy.on('click', '.node-variable',
    ($) -> 
        if this.isOrphan()
            add_role(this)
            reshape()
)

cy.on('mousemove',
    ($) ->
        update_sparql_text()
        check_collisions()
)

cy.on('mouseup',
    ($) -> 
        save_state()
)

init = ->
    left_panel = document.getElementById("config")
    button = document.createElement('button')
    button.innerHTML = 'undo'
    button.onclick = ($) -> 
        undo(state_buffer)
    left_panel.append(button)

init()
reshape()
cy.resize()
