# define the behaviour of the menu buttons located over the query canvas
class window.SparqlingMenu

    constructor: (context) ->
        @context = context
        @init()


    change_size: (query_canvas_size) =>
        @context.sidenav.query_canvas.style.height = query_canvas_size + "%"
        sparql_textbox.style.height = (100 - 10 - query_canvas_size) + "%"
        setTimeout =>
            @context.graph.cy.resize()
        , 550


    create_div: (innerHTML = null, className = null, id = null, onclick = null, tooltip = null) ->
        div             = document.createElement('div')
        div.innerHTML   = innerHTML
        div.className   = className + ' grapholscape-tooltip'
        div.id          = id
        div.onclick     = onclick

        if tooltip != null
            span                = document.createElement('span')
            span.innerHTML      = tooltip
            span.className      = 'tooltiptext'
            span.style.display  = 'none'
            div.append(span)

            div.onmouseover     = () => span.style.display = 'block'
            div.onmouseout      = () => span.style.display = 'none'

        return div


    create_navigation_div: =>
        nav_div = @create_div(null, null, 'nav_div')

        nav_div.append(@create_div('▲', 'sparqling_resize_button', null, ( => @change_size(90)), 'expand graph'))
        nav_div.append(@create_div('≡', 'sparqling_resize_button', null, ( => @change_size(60)), 'center'))
        nav_div.append(@create_div('▼', 'sparqling_resize_button', null, ( => @change_size(0)), 'expand sparql'))

        return nav_div


    set_invisible: ->
      for elem in document.getElementsByClassName('sparqling_menu_button')
        elem.style.display = 'none'
      for elem in document.getElementsByClassName('sparqling_resize_button')
        elem.style.display = 'none'

    set_visible: ->
      for elem in document.getElementsByClassName('sparqling_menu_button')
        elem.style.display = 'inline-block'
      for elem in document.getElementsByClassName('sparqling_resize_button')
        elem.style.display = 'inline-block'


    init: =>
        menu = @create_div(null, null, 'painless_menu')

        document.getElementById('sidenav').append(menu)

        menu.append(@create_navigation_div())

        plaintext_query = '
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            PREFIX : <http://www.aci.it/ontology#>
            PREFIX xml: <http://www.w3.org/XML/1998/namespace>
            PREFIX aci: <http://www.aci.it/ontology#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            Select ?idVeicolo ?inizioStato ?fineStato
                   ?idFormalitaGeneratrice
                   ?idFormalitaOriginaria ?codiceFormalitaOriginaria ?dataAccettazioneFormalitaOriginaria ?ufficioCompetenteFormalitaOriginaria
                   ?serieTarga ?numeroTarga ?serieTargaPrecedente ?numeroTargaPrecedente
                   ?telaio ?kw ?cilindrata ?peso ?portata ?tara ?classe ?uso ?carrozzeria ?specialita
                   ?alimentazione ?alimentazioneDTT
                   ?dataImmatricolazione
                   ?codiceUltimaFormalitaDiParte ?dataUltimaFormalitaDiParte
            where
            {
                ?veicolo aci:ID_veicolo ?idVeicolo.
                ?veicolo aci:ha_stato_di_veicolo ?stato.
                ?stato a aci:Stato_rappresentato_valido.
                ?stato aci:ha_targa ?targa.
                ?targa aci:numero_targa ?numeroTarga.
                ?targa aci:serie_targa ?serieTarga.
                ?stato aci:ha_formalita_originaria ?formalitaOriginaria.
                ?formalitaOriginaria aci:ID_formalita ?idFormalitaOriginaria.
                ?formalitaOriginaria aci:codice_tipo ?codiceFormalitaOriginaria.
                ?evento aci:determina_stato ?stato.
                ?formalitaGeneratrice aci:formalita_genera_evento ?evento.
                ?formalitaGeneratrice aci:ID_formalita ?idFormalitaGeneratrice.
                ?stato aci:inizio_stato_del_mondo ?inizioStato.
                ?stato aci:fine_stato_del_mondo ?fineStato.
                ?formalitaOriginaria aci:data_accettazione_formalita ?dataAccettazioneFormalitaOriginaria.
                ?formalitaOriginaria aci:est_di_competenza_di_ufficio ?ufficio.
                ?ufficio aci:descrizione_ufficio ?ufficioCompetenteFormalitaOriginaria.
                ?stato aci:codice_tipo_ultima_formalita_di_parte ?codiceUltimaFormalitaDiParte.
                ?stato aci:data_accettazione_ultima_formalita_di_parte ?dataUltimaFormalitaDiParte.
                ?stato aci:ha_targa_precedente ?targaPrecedente.
                ?targaPrecedente aci:numero_targa ?numeroTargaPrecedente.
                ?targaPrecedente  aci:serie_targa ?serieTargaPrecedente.
                ?stato aci:numero_telaio ?telaio.
                ?stato aci:kw ?kw.
                ?stato aci:cilindrata ?cilindrata.
                ?stato aci:peso_complessivo ?peso.
                ?stato aci:portata ?portata.
                ?stato aci:tara ?tara.
                ?stato aci:classe_veicolo ?classe.
                ?stato aci:destinazione_di_uso ?uso.
                ?stato aci:carrozzeria ?carrozzeria.
                ?stato aci:descrizione_specialita ?specialita.
                ?stato aci:data_immatricolazione ?dataImmatricolazione.
                ?stato aci:alimentazione ?alimentazione.
                ?stato aci:alimentazione_DTT ?alimentazioneDTT.
                }'

        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">undo</i>',                 'sparqling_menu_button', null, ( => @context.graph.undo()), 'undo'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">filter_center_focus</i>',  'sparqling_menu_button', null, ( => @context.graph.center_view()), 'center view'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">file_copy</i>',            'sparqling_menu_button', null, ( => @context.graph.copy_to_clipboard()), 'copy to clipboard'))
        #menu.append(@create_div('<i class="material-icons" style="font-size: 18px">save</i>',                 'sparqling_menu_button', null, ( => @context.graph.download()), 'export'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">open_in_browser</i>',      'sparqling_menu_button', null, ( => @context.loader.load(plaintext_query)), 'import'))
        menu.append(@create_div('<i class="material-icons" style="font-size: 18px">clear_all</i>',            'sparqling_menu_button', null, ( => @context.graph.clear_all()), 'clear all'))
