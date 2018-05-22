class window.Void
    

    constructor: ->
        @div = document.createElement('div')
        @div.className = 'void_box'
        @div.innerHTML = "<div style='display:flex'>&nbsp;&nbsp;&nbsp;</div>"

    to_html: =>
        return @div
