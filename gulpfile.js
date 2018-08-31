var gulp = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var babel = require("gulp-babel");
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

gulp.task("js", function () {
  return gulp.src("src/js/main.js")
    .pipe(babel())
    .pipe(gulp.dest("dist/js"));
});

gulp.task('nunjucks', function () {
  return gulp.src('src/*.html')
    .pipe(nunjucksRender({path: ['src/']}))
    .pipe(gulp.dest('dist'))
});

gulp.task('sass', function () {
  return gulp.src('src/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/css'));
});

gulp.task("js-watch", ["js"], function(done) {
  browserSync.reload();
  done();
});

gulp.task("nunjucks-watch", ["nunjucks"], function(done) {
  browserSync.reload();
  done();
});

gulp.task("sass-watch", ["sass"], function(done) {
  browserSync.reload();
  done();
});

gulp.task('browser-sync', function() {
  browserSync.init({
      server: {
          baseDir: "dist"
      }
  });

  gulp.watch("src/js/**/*.js", ['js-watch']);
  gulp.watch("src/sass/**/*.scss", ['sass-watch']);
  gulp.watch("src/**/*.html", ['nunjucks-watch']);

});

gulp.task('build', ['sass', 'js', 'nunjucks'])
gulp.task('dev', ['browser-sync'])