##
## sparqling_storage.coffee
##
## Manages interaction with the local storage API.
##
class window.SparqlingStorage

    # Storage types
    Type: {
        LOCAL:   "localStorage"
        SESSION: "sessionStorage"
    }

    constructor: (context, type = SparqlingStorage::Type.SESSION) ->
        @context = context
        @type = type
        @initStorage()

    initStorage: ->
        if !@storageAvailable(@type)
            throw ("#{@type} is not available")

        @storage = window[@type]
        
    storageAvailable: (type) ->
        try 
            storage = window[type]

            # Test availability of storage
            x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        catch e
            return e instanceof DOMException && (
                e.code == 22   ||   # everything except Firefox
                e.code == 1014 ||   # Firefox
                # test name field too, because code might not be present
                e.name == 'QuotaExceededError'          || # everything except Firefox
                e.name == 'NS_ERROR_DOM_QUOTA_REACHED') && # Firefox
                # acknowledge QuotaExceededError only if there's something already stored
                storage.length != 0

    setItem: (key, value) ->
        @storage.setItem(key, value)

    getItem: (key) ->
        return @storage.getItem(key)

    hasItem: (key) ->
        return @storage.getItem(key) != null

    removeItem: (key) ->
        @storage.removeItem(key)

    clear: ->
        @storage.clear()