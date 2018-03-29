console.log "start"

sparql_text = document.getElementById("sparql_text")

# possible types:
# domain
# range
# attribute
# role

elements = {
    nodes: [
        {data: {id: 'a'}},
        {data: {id: 'b'}},
        {data: {id: 'c', parent: 'a'}, classes: "node-domain"},
        {data: {id: 'd'}}
    ]
    edges: [
        {data: 
            id: 'ab',
            source: 'a',
            target: 'b'
        }
    ] 
}

cy = new cytoscape(
    container: document.getElementById('cy'),
    elements: elements
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
                'background-image' : 'resources/background-circle.png'
                'background-opacity' : '0'
                'shape' : 'rectangle'
                'border-color' : 'white'
            })
)

reshape = ->
    parents = cy.nodes().parents()
    #parents.layout({name:'circle'}).run()
    for parent in parents
        parent.position({x:0, y:0})
        parent.children().layout({name:'circle'}).run()
        for child in parent.children()
            for neighbor in child.neighborhood('node')
                console.log(neighbor)
                neighbor.position('x', child.position('x') + Math.cos(child.position('x') - parent.position('x'))*100)
                neighbor.position('y', child.position('y') + Math.sin(child.position('y') - parent.position('y'))*100)

randomize = (parent_name) ->
    range = Math.random() * (15 - 5)
    for i in [0...range - 1] by 1
        new_node_id = parent_name + Math.round(Math.random()*1000)
        new_node_2_id = parent_name + Math.round(Math.random()*1000)
        cy.add({
            group: 'nodes'
            data: {id: new_node_id, parent: parent_name}
        })
        cy.add({
            group: 'nodes'
            data: {id: new_node_2_id}
            classes: 'node-attribute'
        })
        cy.add({
            group: 'edges'
            data: {
                source: new_node_id,
                target: new_node_2_id
            }
        })
        reshape()

cy.on('click', ':parent', 
    ($) ->
        cy.add({
            group: 'nodes'
            data: {id: this.id() + Math.round(Math.random()*1000), parent: this.id()}
        })
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

randomize('a')
reshape()
