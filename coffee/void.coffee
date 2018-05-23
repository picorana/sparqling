class window.Void
    

    constructor: (parent, position) ->
        @div = document.createElement('div')
        @div.className = 'void_box'
        @div.contentEditable = true
        $(@div).data('parent', parent)
        @position = position
        @div.dataset.filter_position = position

    to_html: =>
        return @div
