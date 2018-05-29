class window.Void
    

    constructor: (parent, position, val) ->
        @div = document.createElement('div')
        @div.className = 'void_box'
        @div.contentEditable = true
        console.log val
        @val = val
        @div.innerHTML = @val
        
        $(@div).data('parent', parent)
        @position = position
        @div.dataset.filter_position = position

    to_html: =>
        return @div
