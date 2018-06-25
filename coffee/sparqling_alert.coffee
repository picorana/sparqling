class window.SparqlingAlert

    instance = null
    @dialog = null

    constructor: ->
        @dialog            = document.createElement('div')
        @dialog.className  = 'sparqling_dialog'

        document.body.append @dialog


    say: (msg) =>
        @dialog.innerHTML = msg
        @dialog.style.bottom = '5%'
        @dialog.onmouseover = () =>
            setTimeout(( () => @dialog.style.bottom = '-20%'), 300)
        setTimeout(( () => @dialog.style.bottom = '-20%'), 3000)
