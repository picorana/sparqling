class window.PainlessContextMenu

    constructor: (cy) ->
        @cy = cy
        @init()

    init: =>
        node_variable_context_menu = {
            selector: '.node-variable',
            commands: [
                {content: 'delete node', select: (ele)=> 
                    to_remove = []
                    for link in ele.data('links')
                        if link != null and link != undefined
                           to_remove.push(link)
                    for link in to_remove
                        link.delete()
                    @cy.remove(ele)
                },
                {content: 'center view', select: (ele)=> @center_view(ele)}
                {content: 'add node to select statement', select: (ele)=>@add_to_select(ele.id())},
                {content: 'rename node'},
                {content: 'transform into constant [object]', select: 
                    (ele)=> 
                        ele.data('color', tinycolor(ele.data('color')).desaturate(50).toString())
                        ele.data('label', 'const.')
                        ele.classes('node-constant-object')
                }
                {content: 'transform into constant [value]', select: 
                    (ele)=> 
                        ele.data('color', tinycolor(ele.data('color')).desaturate(50).toString())
                        ele.data('label', 'const.')
                        ele.classes('node-constant-value')
                }
            ] 
        }

        node_link_context_menu = {
            selector: '.node-role',
            commands: [
                {content: 'reverse', select: 
                    (ele)=>
                        console.log ele.data('links') 
                        ele.data('links')[0].reverse()
                },
                {content: 'delete', select: (ele)=> ele.data('links')[0].delete()}
            ]
        }

        node_concept_menu = {
            selector: '.node-concept',
            commands: [
                {content: 'delete', select: (ele)=> ele.data('links')[0].delete()}
            ]
        }

        node_constant_value_menu = {
            selector: '.node-constant-value',
            commands: [
                {content: 'string',     select: (ele)=> ele.data('links')[0].delete()},
                {content: 'int',        select: (ele)=> ele.data('links')[0].delete()},
                {content: 'float',      select: (ele)=> ele.data('links')[0].delete()},
                {content: 'bool',       select: (ele)=> ele.data('links')[0].delete()},
                {content: 'delete',     select: (ele)=> ele.data('links')[0].delete()}
            ]
        }

        node_constant_object_menu = {
            selector: '.node-constant-object',
            commands: [
                {content: 'delete',     select: (ele)=> ele.data('links')[0].delete()}
            ]
        }

        @cy.cxtmenu(node_variable_context_menu)
        @cy.cxtmenu(node_link_context_menu)
        @cy.cxtmenu(node_concept_menu)
        @cy.cxtmenu(node_constant_value_menu)
