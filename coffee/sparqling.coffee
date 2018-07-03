# Main class of the application, keeps together all the different components,
# and defines the interaction with the grapholscape graph.
class window.Sparqling

    instance = null

    # __tappedBefore__ and __tappedTimeout__ are doubleclick timers
    tappedBefore = null
    tappedTimeout = null

    # note that __@graphol_cy__ is the cytoscape instance from grapholscape,
    # while __@cy__ is the new instance created by sparqling to represent the query.
    constructor: (graph) ->
        if instance
            return instance
        else
            @graphol    = graph
            @graphol_cy = graph.cy
            instance    = this
            do @init


    init : ->
        @sidenav        = new SparqlingNavbar this
        @graph          = new SparqlingGraph this
        @menu           = new SparqlingMenu this
        @loader         = new QueryLoader this
        @alert          = new SparqlingAlert
        @sparql_text    = @graph.sparql_text

        do @add_event_listener


    # Add the __selected node__ in grapholscape to the query,
    # according to the type of the node (stored in node.data('type')).
    # Nodes can be 'role', 'attribute' or 'concept'
    add_to_query: =>
        selected_node = @graphol_cy.nodes(":selected")

        if selected_node.length == 0
            @alert.say "please, select a node in the main graph"

        switch selected_node.data('type')
            when "role"         then @graph.add_link(selected_node.data('label'), 'role')
            when "attribute"    then @graph.add_link(selected_node.data('label'), 'attribute', @extract_datatype(selected_node))
            when "concept"      then @graph.add_link(selected_node.data('label'), 'concept')


    # extracts the attribute type from the grapholscape graph
    extract_datatype: (inode) =>
        for neighbor in inode.neighborhood('node')
            if neighbor.data('type') == "range-restriction"
                for node in neighbor.neighborhood('node')
                    if node.data('type') == "value-domain"
                        return node.data('label')


    # debug bindings - to be removed
    onkeypress_handler : (event) =>
        if event.key == "d"
            console.log @graph.cy.nodes(":selected").data('links')

        if event.key == "c"
            console.log @graph.links

        else if event.keyCode == 46 or event.keyCode == 8 or event.keyCode == 127
            for link in @graph.cy.nodes(":selected").data('links')
                link.delete()


    # since cytoscape does not emit doubleclick events, we create one based on the tap event.
    doubleclick_handler: (event) =>
        tappedNow = event.target;
        if tappedTimeout && tappedBefore
            clearTimeout(tappedTimeout);

        if tappedBefore == tappedNow
            tappedNow.trigger('doubleTap', event);
            tappedBefore = null;
            originalTapEvent = null;
            @add_to_query()
        else
            tappedTimeout = setTimeout(()=>
                    tappedBefore = null
                , 300);
            tappedBefore = tappedNow;


    add_event_listener : ->
        # keypress handler
        window.addEventListener('keypress', (event) => @onkeypress_handler(event))

        # fix sizes on window resize
        for event in ['resize', 'fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange']
            window.addEventListener(event, () =>
                @sidenav.resize_navbar()
                @menu.change_size(50)
            )

        # doubleclick handler on grapholscape
        @graphol_cy.on('tap', (event) => @doubleclick_handler(event))
