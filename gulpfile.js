let gulp = require('gulp');
let del = require('del');
let sass = require('gulp-sass');
let nunjucksRender = require('gulp-nunjucks-render');
let browserify = require('browserify');
let babelify = require('babelify');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');
let cleanCSS = require('gulp-clean-css');
let uglify = require('gulp-uglify');
let htmlmin = require('gulp-htmlmin');
let browserSync = require('browser-sync').create();

let shared = {
  clear: () => {
    return del(['dist']);
  },
  assets: () => {
    return gulp.src('src/assets/**/*')
      .pipe(gulp.dest('dist/assets'))
  },
  help: (done) => {
    console.info('###############################################################################')
    console.info('')
    console.info('Help:')
    console.info('')
    console.info('*gulp dev* to development mode')
    console.info('*gulp build* to deployment mode')
    console.info('*gulp clear* to clear dist folder')
    console.info('')
    console.info('###############################################################################')

    done();
  }
}

let dev = {
  html: () => {
    return gulp.src('src/*.html')
      .pipe(nunjucksRender({
        path: ['src/']
      }))
      .pipe(gulp.dest('dist'))
  },
  styles: () => {
    return gulp.src('src/scss/main.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('dist/css'));
  },
  scripts: () => {
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
  },
  reload: (done) => {
    browserSync.reload()
    return done();
  },
  serve: () => {
    browserSync.init({
      server: {
        baseDir: "dist"
      }
    });

    gulp.watch('src/js/**/*.js', gulp.series(dev.scripts, dev.reload))
    gulp.watch('src/scss/**/*.scss', gulp.series(dev.styles, dev.reload))
    gulp.watch('src/**/*.html', gulp.series(dev.html, dev.reload))
  }
}

let build = {
  html: () => {
    return gulp.src('src/*.html')
      .pipe(nunjucksRender({
        path: ['src/']
      }))
      .pipe(htmlmin({
        collapseWhitespace: true
      }))
      .pipe(gulp.dest('dist'))
  },
  styles: () => {
    return gulp.src('src/scss/main.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(cleanCSS())
      .pipe(gulp.dest('dist/css'));
  },
  scripts: () => {
    return browserify({
        entries: 'src/js/main.js',
        debug: true
      })
      .transform(babelify.configure({
        presets: ["@babel/preset-env"]
      }))
      .bundle()
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'));
  }
}

//mainTasks exposed to gulp
gulp.task('clear', shared.clear),
gulp.task('help', shared.help),
gulp.task('dev', gulp.series(shared.clear, gulp.parallel(dev.html, dev.styles, dev.scripts, shared.assets), dev.serve)),
gulp.task('build', gulp.series(shared.clear, gulp.parallel(build.html, build.styles, build.scripts, shared.assets))),

//default dev
gulp.task('default', shared.help)