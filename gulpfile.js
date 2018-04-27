var gulp = require("gulp");
var coffee = require("gulp-coffee");
var gulpUglify = require("gulp-uglify");
var gulpConcat = require("gulp-concat");
var merge2 = require("merge2");

gulp.task("build", function() {
  var c = gulp.src("./coffee/*.coffee").pipe(coffee({ bare: true }));
  var j = gulp.src([
    "./node_modules/dragula/dist/dragula.js",
    "./node_modules/cytoscape-cola/cytoscape-cola.js",
    "./node_modules/simple-scrollbar/simple-scrollbar.js"
  ]);

  merge2([j, c])
    .pipe(gulpConcat("./js/app.js"))
    .pipe(gulp.dest("."));
});

gulp.task("watch", function() {
  gulp.watch("./coffee/*.coffee", ["build"]);
});

gulp.task("default", ["watch"]);
