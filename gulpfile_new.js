var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
var path =  require('path');

var config = {
  jsExt: {
    files: "js-ext/**/*",
  },
  coffee: {
    files: "coffee/*",
    dest: "js"
  },
  uglify: {
    files: "js/*",
    dest: "js-min"
  },
  concat: {
    files: "js/*",
    dest: "dist",
    prefix: "",
    packages: {
      "app": [
        "./node_modules/dragula/dist/dragula.js",
        "./node_modules/cytoscape-cola/cytoscape-cola.js",
        "./node_modules/simple-scrollbar/simple-scrollbar.js",
        "./node_modules/cytoscape-cxtmenu/cytoscape-cxtmenu.js",
        "./node_modules/tinycolor2/dist/tinycolor-min.js",
        "js-min/*"
      ]
    }
  }
};


// Coffee good to go
gulp.task('coffee', function(){
  return gulp.src(config.coffee.files)
    .pipe(coffee())
    .pipe(gulp.dest(config.coffee.dest));
});

// Uglify good to go
gulp.task('uglify', ['coffee'], function(){
  return gulp.src(config.uglify.files)
    .pipe(uglify())
    .pipe(gulp.dest(config.uglify.dest));
});

// Concat ready to go
gulp.task('concat', ['coffee', 'uglify'], function(){
  var fileName = "";
  Object.keys(config.concat.packages).forEach(function(key) {
    fileName = config.concat.prefix + key + ".js";
    gulp.src(config.concat.packages[key])
      .pipe(concat(fileName))
      .pipe(gulp.dest(config.concat.dest));
  });
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(config.coffee.files, ['coffee', 'uglify', 'concat']);
  gulp.watch(config.jsExt.files, ['concat']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['coffee', 'uglify', 'concat', 'watch']);