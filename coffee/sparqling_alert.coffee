class window.SparqlingAlert

    instance = null
    @dialog = null

    Level: {
        ERROR: alert_palette.error,
        WARN: alert_palette.warn,
        INFO: alert_palette.info,
        DEBUG: alert_palette.debug
    }

    constructor: ->
        @dialog            = document.createElement('div')
        @dialog.className  = 'sparqling_dialog'
        @dialog.style.opacity = '0'
        @dialog.style.bottom = '5%'

        document.getElementById("grapholscape-container").append @dialog


    say: (msg, level = SparqlingAlert::Level.ERROR) =>
        @dialog.innerHTML = msg
        @dialog.style.backgroundColor = level
        @dialog.style.borderColor = tinycolor(level).darken(50).toString()
        @dialog.style.opacity = '1'
        @dialog.onmouseover = () =>
            setTimeout(( () => @dialog.style.opacity = '0'), 300)
        setTimeout(( () => @dialog.style.opacity = '0'), 3000)

    error: (msg) => @say(msg, SparqlingAlert::Level.ERROR)
    warn:  (msg) => @say(msg, SparqlingAlert::Level.WARN)
    info:  (msg) => @say(msg, SparqlingAlert::Level.INFO)
    debug: (msg) => @say(msg, SparqlingAlert::Level.DEBUG)
