var fs = require("fs");
var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var nunjucksRender = require('gulp-nunjucks-render');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync').create();

function _clean() {
  return del(['dist']);
}

function _html() {
  return gulp.src('src/*.html')
    .pipe(nunjucksRender({
      path: ['src/']
    }))
    .pipe(gulp.dest('dist'))
}

function _style() {
  return gulp.src('src/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/css'));
}

function _scripts() {
  return browserify({
      entries: 'src/js/main.js',
      debug: true
    })
    .transform(babelify.configure({
      presets: ["@babel/preset-env"]
    }))
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('dist/js'));
}

function _assets() {
  return gulp.src('src/assets/**/*.*')
    .pipe(gulp.dest('dist/assets'))
}

function _reload(done) {
  browserSync.reload()
  return done();
}

function _browserSync() {
  browserSync.init({
    server: {
      baseDir: "dist"
    }
  });

  gulp.watch('src/js/**/*.js', gulp.series(_scripts, _reload))
  gulp.watch('src/scss/**/*.scss', gulp.series(_style, _reload))
  gulp.watch('src/**/*.html', gulp.series(_html, _reload))
}

var build = gulp.series(_clean, gulp.parallel(_html, _style, _scripts, _assets));
var dev = gulp.series(_clean, gulp.parallel(_html, _style, _scripts, _assets), _browserSync);

gulp.task('clear', _clean)
gulp.task('build', build)
gulp.task('dev', dev)

gulp.task('default', dev)