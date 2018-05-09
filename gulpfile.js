var gulp = require("gulp");
var coffee = require("gulp-coffee");
var uglify = require('gulp-uglify-es').default;
var gulpConcat = require("gulp-concat");
var merge2 = require("merge2");
var pump = require("pump");


gulp.task("build", function() {

  var c = gulp.src("./coffee/*.coffee").pipe(coffee({ bare: true }));
  var j = gulp.src([
    "./node_modules/dragula/dist/dragula.js",
    "./node_modules/cytoscape-cola/cytoscape-cola.js",
    "./node_modules/simple-scrollbar/simple-scrollbar.js",
    "./node_modules/cytoscape-cxtmenu/cytoscape-cxtmenu.js",
    "./node_modules/tinycolor2/dist/tinycolor-min.js"
  ]);


  merge2([j, c])
    .pipe(gulpConcat("./dist/painless_sparql.js"))
    .pipe(gulp.dest("."));
});

gulp.task("compress", function() {

  var c = gulp.src("./coffee/*.coffee").pipe(coffee({ bare: true }));
  var j = gulp.src([
    "./node_modules/dragula/dist/dragula.js",
    "./node_modules/cytoscape-cola/cytoscape-cola.js",
    "./node_modules/simple-scrollbar/simple-scrollbar.js",
    "./node_modules/cytoscape-cxtmenu/cytoscape-cxtmenu.js",
    "./node_modules/tinycolor2/dist/tinycolor-min.js"
  ]);

  merge2([j, c])
    .pipe(gulpConcat("./dist/painless_sparql_min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("."));
});

gulp.task("watch", function() {
  gulp.watch("./coffee/*.coffee", ["build"]);
});

gulp.task("default", ["watch"]);
