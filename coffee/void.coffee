class window.Void
    

    constructor: ->
        @div = document.createElement('div')
        @div.className = 'void_box'
        @div.innerHTML = "&nbsp;&nbsp;&nbsp;"

    to_html: =>
        return @div
