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


    # TODO: implement properly
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


    is_attribute_triple: (triple) =>
        for node in @context.graphol.predicates
            compare_label = null
            if node.data('label') == undefined
                continue
            if  node.data('label').indexOf(':') == -1
                compare_label = node.data('label')
            else compare_label = node.data('label').split(':')[1]

            # Remove newline from predicate name
            compare_label = compare_label.replace(/[\n\r]+/g, '').replace(/^\s+|\s+$/,'')

            if compare_label == @remove_prefix(triple['predicate']) && node.data('type') == 'attribute'
                return true

        return false


    is_variable_token: (token) =>
        return token.charAt(0) == '?' || token.charAt(0) == '$'


    is_literal_token: (token) =>
        return token.charAt(0) == '"' || token.charAt(0) == "'"


    is_iri_token: (token) =>
        return token.charAt(0) == '<' || (!@is_literal_token(token) && token.indexOf(':') != -1)


    is_blank_node: (token) =>
        return token.charAt(0) == '_'


    parse_literal: (literal) =>
        match = literal.match(/^(".*?")[\s\^]*(.+?)(@.+?)?$/)

        if match.length < 2
            throw ("unable to parse lexical form for literal: " + literal)

        return {
            lexical_form: match[1]
            datatype: match[2]
            langtag: match[3] || null
        }


    get_short_iri: (iri, prefixes) =>
        for key, value of prefixes
            if iri.indexOf(value) != -1
                return key + ":" + iri.substr(value.length)
        return iri


    get_node_for_token: (triple, position) =>
        token = triple[position]
        result = null

        if @is_variable_token(token)
            variable_name = token.slice(1)
            # if the variable does not already exist in current query
            if @cy.getElementById(variable_name).length == 0
                result = @cy.add({
                    group: 'nodes'
                    classes: 'node-variable' + (if @is_attribute_triple(triple) && position == 'object' then ' attr-range' else ' node-variable-full-options')
                    data: {
                        id: variable_name
                        label: token
                        color: '#' + palette[@color_index % palette.length]
                        links: []
                    }
                })

                result = result[0]
                @color_index += 1

            else
                result = @cy.getElementById(variable_name)
        else if @is_iri_token(token)
            iri = token
            result = @cy.add({
                group: 'nodes'
                classes: 'node-constant-object'
                data: {
                    id: iri
                    label: iri
                    color: tinycolor('#' + palette[@color_index % palette.length]).desaturate(70).toString()
                    links: []
                }
            })

            result = result[0]
            @color_index += 1
        else if @is_literal_token(token)
            literal = @parse_literal(token)
            result = @cy.add({
                group: 'nodes'
                classes: 'node-constant-value'
                data: {
                    id: literal.lexical_form
                    label: literal.lexical_form
                    color: tinycolor('#' + palette[@color_index % palette.length]).desaturate(70).toString()
                    links: []
                }
            })

            result = result[0]
            @color_index += 1
        else
            throw ('unable to create node for token: ' + token)

        return result


    load: (plaintext_query) =>
        parsed_query = window.sparqljs.Parser().parse(plaintext_query);

        for triple in parsed_query['where'][0]['triples']

            if !@is_valid_triple(triple)
                return

            if @is_concept_triple(triple)
                subj = @get_node_for_token(triple, 'subject')
                pred = @get_short_iri(triple['object'], parsed_query['prefixes'])
                link = new PainlessLink(this, @cy, pred, 'concept', subj)
            else
                subj = @get_node_for_token(triple, 'subject')
                pred = @get_short_iri(triple['predicate'], parsed_query['prefixes'])
                obj = @get_node_for_token(triple, 'object')
                type = if @is_attribute_triple(triple) then 'attribute' else 'role'
                link = new PainlessLink(this, @cy, pred, type, subj, obj)
            @links.push(link)

        jQuery.each(parsed_query['variables'], (elem) =>
            @sparql_text.select_boxes.push(parsed_query['variables'][elem].slice(1))
            )

        @context.graph.reshape()
        @sparql_text.update()