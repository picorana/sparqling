class window.Void


    constructor: (parent, position, val) ->
        @div = document.createElement('div')
        @div.className = 'void_box'
        @div.contentEditable = true
        @val = val
        @div.innerHTML = @val

        jQuery(@div).data('parent', parent)
        @position = position
        @div.dataset.filter_position = position
        @div.style.transitionDuration = '0.1s'

    to_html: =>
        return @div
