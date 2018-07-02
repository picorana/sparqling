class window.QueryLoader

    constructor: (context) ->
        @context = context
        @cy = @context.graph.cy
        @sparql_text = @context.graph.sparql_text
        @color_index = @context.graph.color_index
        @links = @context.graph.links


    check_existence: (label) =>
        for node in @context.graphol.predicates
            if node.data('label') == undefined 
                continue

            if node.data('label').indexOf(':') != -1
                compare_label = node.data('label').split(':')[1]
            else 
                compare_label = node.data('label')

            compare_label = compare_label.replace(/[\n\r]+/g, '').replace(/^\s+|\s+$/,'') 

            if label == compare_label
                    return true

        @context.alert.say 'node ' + label + ' does not exist in current ontology, invalid query'
        return false


    remove_prefix: (s) =>
        return s.split('#')[1]


    is_valid_triple: (triple) =>

        if @is_concept_triple(triple)
            if @check_existence(@remove_prefix(triple['object']))
                return true

        else 
            if @check_existence(@remove_prefix(triple['predicate']))
                return true
            
        return false


    is_concept_triple: (triple) =>
        if triple['predicate'] == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            return true
        else return false


    load: (plaintext_query) =>
        
        parsed_query = window.sparqljs.Parser().parse(plaintext_query);

        for triple in parsed_query['where'][0]['triples']

            if !@is_valid_triple(triple)
                return

            # if subject does not already exist in current query
            if @cy.getElementById(triple['subject'].slice(1)).length == 0

                subj = @cy.add({ 
                    group: 'nodes'
                    classes: 'node-variable'
                    data: {
                        id: triple['subject'].slice(1)
                        label: '?' + triple['subject']
                        color: '#' + palette[@color_index % palette.length]
                        links: []
                    }
                })

                @color_index += 1
                subj = subj[0]

            else 

                subj = @cy.getElementById(triple['subject'].slice(1))

            # if object is a variable
            if triple['object'].charAt(0) == '?'

                if @cy.getElementById(triple['object'].slice(1)).length == 0

                    obj = @cy.add({ 
                        group: 'nodes'
                        classes: 'node-variable'
                        data: {
                            id: triple['object'].slice(1)
                            label: triple['object']
                            color: '#' + palette[@color_index % palette.length]
                            links: []
                        }
                    })

                    obj = obj[0]
                    @color_index += 1

                else

                    obj = @cy.getElementById(triple['object'].slice(1))

            else 

                obj = @cy.add({ 
                    group: 'nodes'
                    classes: 'node-constant-value'
                    data: {
                        id: triple['object']
                        label: triple['object']
                        color: '#aaa'
                        links: []
                    }
                })

                obj = obj[0]


            jQuery.each(parsed_query['prefixes'], (elem) => 
                if triple['predicate'].indexOf(parsed_query['prefixes'][elem]) != -1
                    triple['predicate'] = triple['predicate'].substr(parsed_query['prefixes'][elem].length)
                    )

            link = new PainlessLink(this, @cy, triple['predicate'], 'role', subj, obj)
            @links.push(link)

        jQuery.each(parsed_query['variables'], (elem) =>
            @sparql_text.select_boxes.push(parsed_query['variables'][elem].slice(1))
            )

        @context.graph.reshape()
        @sparql_text.update()