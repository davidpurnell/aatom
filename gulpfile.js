//core packages
var gulp = require('gulp')
var sass = require('gulp-sass')
var del = require('del')
var concat = require('gulp-concat')
var order = require('gulp-order')
var gulpif = require('gulp-if')
var fs = require('fs') //part of node, ie not a separate package
//processing, cleaning, minifying
var inject = require('gulp-inject')
var sourcemaps = require('gulp-sourcemaps')
var postcss = require('gulp-postcss')
var uncss = require('postcss-uncss');
var autoprefixer = require('autoprefixer')
var uglify = require('gulp-uglify')
var htmlclean = require('gulp-htmlclean')
var realFavicon = require ('gulp-real-favicon')
var useref = require('gulp-useref')
//developement server
var browserSync = require('browser-sync').create()


// configuration variables
var paths = {
  srcHTML: 'src/**/*.html',
  srcSCSS: 'src/scss/**/*.scss',
  srcJS: 'src/js/**/*.js',
  srcIMG: 'src/img/**/*',
  srcFavIcons: 'src/favicons/*',
  vendorBsCSS: 'node_modules/bootstrap/dist/css/bootstrap.css',
  vendorBsJS: 'node_modules/bootstrap/dist/js/bootstrap.js', //does not include Popper
  vendorJQ: 'node_modules/jquery/dist/jquery.js',
  vendorJQE: 'node_modules/jquery.easing/jquery.easing.js',

  dev: 'dev',
  devIndex: 'dev/index.html', // use with inject:dev later
  devCSS: 'dev/**/*.css', // use with inject:dev later
  devJS: 'dev/**/*.js', // use with inject:dev later

  devJQ: 'jquery.js',
  devJQE: 'jquery.easing.js',
  devBsCSS: 'bootstrap.css',
  devBsJS: 'bootstrap.js',
  devMyCSS: 'affable.css',
  devMyJS: 'affable.js',

  dist: 'dist',
  distIndex: 'dist/index.html', // use with inject:dist later
  distCSS: 'dist/**/*.css', // use with inject:dist later
  distJS: 'dist/**/*.js', // use with inject:dist later

  FavIconMaster: 'assets/nav-logo.svg',
  FavIcons: 'src/favicons'
}

// build the dev folder
// cp favicons from src & vendor files from /node_modules
function cpStatic() {
  return gulp
    .src([
      paths.srcFavIcons,
      paths.vendorBsCSS,
      paths.vendorBsJS,
      paths.vendorJQ,
      paths.vendorJQE
    ])
    .pipe(gulp.dest(paths.dev))
}
//inject js & css references into html
function injectHtml() {
  return gulp.src(paths.devIndex)
    .pipe(inject(gulp.src(paths.devCSS, {read: false})
    .pipe(order([
      paths.devBsCSS,
      paths.devMyCSS
    ])), {relative: true}))
    .pipe(inject(gulp.src(paths.devJS, {read: false})
    .pipe(order([
      paths.devJQ,
      paths.devJQE,
      paths.devBsJS,
      paths.devMyJS
    ])), {relative: true}))
    .pipe(gulp.dest(paths.dev))
}
//cp HTML
function cpHtml() {
  return gulp.src(paths.srcHTML)
	.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
  .pipe(gulp.dest(paths.dev))
}
//cp IMG
function cpImg() {
  return gulp.src(paths.srcIMG)
  .pipe(gulp.dest(paths.dev))
}
//cp JS
function cpJs() {
  return gulp.src(paths.srcJS)
  .pipe(gulp.dest(paths.dev))
}
// process SCSS
function processSCSS() {
  var plugins = [
    autoprefixer({browsers: ['> 1%']})
    //add plugin to remove unused/unreferenced css styles?
  ]

  return gulp
    .src(paths.srcSCSS)
    .pipe(sourcemaps.init())
    .pipe(sass.sync({ errLogToConsole: true, outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dev))
}
//build the dist folder
//cp static files from dev to dist
function cpDist() {
  return gulp
    .src([
      paths.dev + '/*',
      '!' + paths.devIndex,
      '!' + paths.devCSS,
      '!' + paths.devJS
     ])
    .pipe(gulp.dest(paths.dist))
}
//inject css, js references and concat files from dev to dist
function userefDist() {
  return gulp
    .src(paths.devIndex)
    .pipe(useref())
    .pipe(gulp.dest(paths.dist))
}

function uncssDist() {
  var plugins = [
    uncss({
      html: [paths.distIndex],
      ignore: [/#mainNav.*/,/.+\.testing/,/\.alert.*/,/.*close.*/,'.fadeIn','.fadeOut']
    }),
  ];
  return gulp.src(paths.distCSS)
    .pipe(postcss(plugins))
    .pipe(gulp.dest(paths.dist));
};

//start a browserSync instance
function browserSyncInit(baseDir, files) {
  browserSync.instance = browserSync.init(files, {
    startPath: '/',
    server: {
      baseDir: baseDir
    },
    ghostMode: false
  })
}
//throw an error
function throwError(taskName, msg) {
  throw new PluginError({
      plugin: taskName,
      message: msg
    })
}
//Watch src files for changes
function watchSrc() {
  gulp.watch(paths.srcHTML, gulp.series(cpHtml,injectHtml))
  gulp.watch(paths.srcIMG, cpImg)
  gulp.watch(paths.srcJS, cpJs)
  gulp.watch(paths.srcSCSS, processSCSS)
}

//delete stuff
function cleanDev() {
  return del(paths.dev)
}
function cleanDist() {
  return del(paths.dist)
}
//start Dev server
function startDevServer() {
  browserSyncInit(paths.dev, paths.dev)
}
//start Dist server
function startDistServer() {
  browserSyncInit(paths.dist)
}
//builds the dev folder
gulp.task('build', gulp.series(gulp.parallel(cpStatic, cpHtml, cpImg, cpJs, processSCSS), injectHtml))
gulp.task('build').description = 'build the dev folder'
//builds the dist folder
gulp.task('build:dist', gulp.series('build',gulp.parallel(cpDist,userefDist),uncssDist))
gulp.task('build:dist').description = 'build the dist folder'
// starts a development server
gulp.task('serve', gulp.series('build', gulp.parallel(startDevServer,watchSrc)))
gulp.task('serve').description = 'build dev from src, start dev server, watch src for changes'
// starts a development server
gulp.task('serve:dist', gulp.series('build:dist', startDistServer))
gulp.task('serve:dist').description = 'build dev from src, build dist from dev, start dist server'

//delete dev and production builds
gulp.task('clean', gulp.parallel(cleanDev,cleanDist))
gulp.task('clean').description = 'empties build folders'
gulp.task('clean').flags = {
  '--dev': 'empties the dev folder',
  '--dist': 'empties the dist folder'
}


//RealFaviconGenerator
// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json'
// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: paths.FavIconMaster,
		dest: paths.FavIcons,
		iconsPath: '/',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'blackAndWhite',
				threshold: 50,
				themeColor: '#5bbad5'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done()
	})
})

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err
		}
	})
  done()
})
