class window.Sparqling
    ###* 
        Main class of the application, keeps together all the different components,
        and defines the interaction with the grapholscape graph.
    ###

    instance = null

    ###* doubleclick timers ###
    tappedBefore = null
    tappedTimeout = null
 

    constructor: (graph) ->
        if instance
            return instance
        else    
            @graphol_cy = graph.cy

            @init()

            instance = this


    init : ->
        @sidenav        = new SparqlingNavbar(this)
        @graph          = new SparqlingGraph(this)
        @sparql_text    = @graph.sparql_text
        @menu           = new PainlessMenu(this)
        @add_event_listener()
        @dialog = @create_dialog()


    add_to_query: =>
        ###* Adds the selected node in grapholscape to the query ###

        selected_node = @graphol_cy.nodes(":selected")
        
        if selected_node.length == 0
            @alert "please, select a node in the main graph"
        
        switch selected_node.data('type')
            when "role"         then @graph.add_link(selected_node.data('label'), 'role')
            when "attribute"    then @graph.add_link(selected_node.data('label'), 'attribute', @extract_datatype(selected_node))
            when "concept"      then @graph.add_link(selected_node.data('label'), 'concept')


    create_dialog: ->
        dialog                  = document.createElement('div')
        dialog.className        = 'dialog'

        document.body.append(dialog)
        return dialog


    alert: (msg) =>
        @dialog.innerHTML = msg
        @dialog.style.bottom = '5%'
        @dialog.onmouseover = () => 
            setTimeout(( () => @dialog.style.bottom = '-20%'), 300)
        setTimeout(( () => @dialog.style.bottom = '-20%'), 3000)
            


    extract_datatype: (inode) =>
        for neighbor in inode.neighborhood('node')
            if neighbor.data('type') == "range-restriction"
                for node in neighbor.neighborhood('node')
                    if node.data('type') == "value-domain"
                        return node.data('label')


    onkeypress_handler : (event) =>
        # debug bindings - to be removed
        if event.key == "d"
            console.log @graph.cy.nodes(":selected").data('links')

        if event.key == "c"
            console.log @graph.links

        else if event.keyCode == 46 or event.keyCode == 8 or event.keyCode == 127
            for link in @graph.cy.nodes(":selected").data('links')
                link.delete()


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
        window.addEventListener('resize', () => @resize_navbar())

        # doubleclick handler on grapholscape
        @graphol_cy.on('tap', (event) => @doubleclick_handler(event))

    
