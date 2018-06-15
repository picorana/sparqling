var gulp = require("gulp");
var coffee = require("gulp-coffee");
var uglify = require("gulp-uglify-es").default;
var gulpConcat = require("gulp-concat");
var merge2 = require("merge2");
var less = require("gulp-less");
var path = require("path");
var autoprefixer = require("gulp-autoprefixer");

var module_list = [
  "./node_modules/dragula/dist/dragula.js",
  "./node_modules/cytoscape-cose-bilkent/cytoscape-cose-bilkent.js",
  "./node_modules/simple-scrollbar/simple-scrollbar.js",
  "./node_modules/cytoscape-cxtmenu/cytoscape-cxtmenu.js",
  "./node_modules/tinycolor2/dist/tinycolor-min.js",
  "./node_modules/sparqljs/sparqljs-browser.js"
];

gulp.task("build", function() {
  var c = gulp.src("./coffee/*.coffee").pipe(coffee({ bare: true }));
  var l = gulp.src("./coffee/*.litcoffee").pipe(coffee({ bare: true }));
  var j = gulp.src(module_list);

  merge2([j, l, c])
    .pipe(gulpConcat("./dist/sparqling.js"))
    .pipe(gulp.dest("."));
});

gulp.task("less", function() {
  return gulp
    .src("./less/**/*.less")
    .pipe(less())
    .pipe(gulpConcat("./css/style.css"))
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(gulp.dest("."));
});

gulp.task("compress", function() {
  var c = gulp.src("./coffee/*.coffee").pipe(coffee({ bare: true }));
  var l = gulp.src("./coffee/*.litcoffee").pipe(coffee({ bare: true }));
  var j = gulp.src(module_list);

  merge2([j, l, c])
    .pipe(gulpConcat("./dist/sparqling_min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("."));
});

gulp.task("watch", function() {
  gulp.watch("./coffee/**/*.coffee", ["build"]);
  gulp.watch("./less/**/*.less", ["less"]);
});

gulp.task("default", ["build", "watch"]);
