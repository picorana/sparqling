{exec} = require 'child_process'
Rehab = require 'rehab'

task 'build', 'Build project', sbuild = ->
    files = new Rehab().process './coffee'

    from_files = "--compile #{files.join ' '}"
    exec "coffee --join js/app.js --compile #{files.join ' '}", (err, stdout, stderr) -> 
        throw err if err
        console.log stdout + err
