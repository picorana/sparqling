{exec}  = require 'child_process'
path    = require 'path'

try
    Rehab   = require 'rehab'
    colors  = require 'colors'

task 'build', 'Build project', sbuild = ->
    files = new Rehab().process './coffee'

    exec "coffee --join js/app.js --compile #{files.join ' '}", (err, stdout, stderr) -> 
        throw err if err
        console.log stdout + err

task 'watch', 'Automatically recompile on save', ->
    console.log "Watching coffee files for changes, press Control-C to quit".yellow
    
    files = new Rehab().process './coffee'
    srcWatcher = exec "coffee --join js/app.js --watch --compile #{files.join ' '}"
    srcWatcher.stderr.on 'data', (data) -> console.error data.red
    srcWatcher.stdout.on 'data', (data) ->
        process.stdout.write data.green
    

