class window.SparqlingAlert

    instance = null
    @dialog = null

    constructor: ->
        @dialog            = document.createElement('div')
        @dialog.className  = 'sparqling_dialog'
        @dialog.style.opacity = '0'
        @dialog.style.bottom = '5%'

        document.body.append @dialog


    say: (msg) =>
        @dialog.innerHTML = msg
        @dialog.style.opacity = '1'
        @dialog.onmouseover = () =>
            setTimeout(( () => @dialog.style.opacity = '0'), 300)
        setTimeout(( () => @dialog.style.opacity = '0'), 3000)
