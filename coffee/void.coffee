class window.Void
    

    constructor: ->
        @div = document.createElement('div')
        @div.innerHTML = "&nbsp;void"

    to_html: =>
        return @div
