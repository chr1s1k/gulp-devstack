import gulp, { series, parallel, watch as watchFor } from 'gulp'
import webserver from 'gulp-webserver'
import sass from 'gulp-sass'
import browserSync from 'browser-sync'
import plumber from 'gulp-plumber'
import beeper from 'beeper'
import colors from 'ansi-colors'
import fancylog from 'fancy-log'
import uglify from 'gulp-uglify'
import include from 'gulp-include'
import del from 'del'
import browserify from 'browserify'
import babelify from 'babelify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import handlebars from 'gulp-compile-handlebars'
import rename from 'gulp-rename'
import imagemin from 'gulp-imagemin'
import svgsprite from 'gulp-svg-sprite'
import eslint from 'gulp-eslint'
import gulpif from 'gulp-if'
import prettify from 'gulp-prettify'
import w3cjs from 'gulp-w3cjs'
import concat from 'gulp-concat'

const errorHandler = (err) => {
	beeper() // terminal beep
	fancylog(
		colors.bold.red(err.message) // log a colored message
	)
}

const server = browserSync.create()

let isProduction = false

function setProductionMode(done) {
	isProduction = true
	done()
}

function clean() {
	return del('./dist')
}

function templates() {
	return gulp.src('./src/templates/*.hbs')
		.pipe(handlebars({
			isProduction // pass the variable to be available inside .hbs templates
		}, {
			ignorePartials: true,
			batch: ['./src/templates/partials'] // where to locate partial templates
		}))
		.pipe(rename(path => {
			path.extname = '.html'
		}))
		.pipe(gulpif(isProduction, prettify({
			indent_handlebars: true,
			indent_inner_html: true,
			indent_char: ' ',
			indent_size: 2,
		})))
		.pipe(gulp.dest('./dist'))
		.pipe(server.stream({ reload: true }))
}


function styles() {
	return gulp.src('./src/stylesheets/*.scss', { sourcemaps: true })
		.pipe(plumber({
			errorHandler
		}))
		.pipe(sass({
			precision: 8,
			outputStyle: isProduction ? 'compressed' : 'expanded',
			includePaths: ['./node_modules/']
		})
			.on('error', sass.logError))
		.pipe(gulpif(isProduction, rename(path => {
			path.extname = '.min.css'
		})))
		.pipe(gulp.dest('./dist/css', { sourcemaps: '.' })) // write an external sourcemaps
		.pipe(server.stream())
}

// https://thecodeboss.dev/2016/01/building-es6-javascript-for-the-browser-with-gulp-babel-and-more/
// https://www.sitepoint.com/transpiling-es6-modules-to-amd-commonjs-using-babel-gulp/
function transpilejs() {
	return browserify({
		entries: './src/scripts/main.js',
		debug: false,
		transform: babelify
	})
		.bundle()
		.pipe(source('main.js'))
		.pipe(buffer())
		.pipe(gulpif(isProduction, uglify()))
		.pipe(gulp.dest('./dist/js'))
		.pipe(server.stream({ stream: true }))
}


function images() {
	return gulp.src(['./src/images/**/*', '!./src/images/sprite/**'])
		.pipe(imagemin())
		.pipe(gulp.dest('./dist/images'))
}

function fonts() {
	return gulp.src('./src/fonts/**/*')
		.pipe(gulp.dest('./dist/fonts'))
}

function svg() {
	return gulp.src('./src/images/sprite/*.svg')
		.pipe(svgsprite({
			mode: {
				symbol: {
					dest: '',
					sprite: 'sprite.svg'
				}
			}
		}))
		.pipe(gulp.dest('./dist/images'))
}

function lint() {
	return gulp.src(['./src/scripts/**/*.js', '!./src/scripts/vendors/**/*'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
}

function validateTemplates() {
	return gulp.src('./dist/*.html')
		.pipe(w3cjs())
		.pipe(w3cjs.reporter())
}

function vendorsjs() {
	return gulp.src('./src/scripts/vendors/index.js')
		.pipe(plumber({
			errorHandler
		}))
		.pipe(include({
			includePaths: [
				'./node_modules'
			]
		}))
		.pipe(rename(path => {
			path.basename = 'vendors'
		}))
		.pipe(gulpif(isProduction, uglify()))
		.pipe(gulp.dest('./dist/js'))
}

function concatjs() {
	return gulp.src('./dist/js/*.js')
		.pipe(concat('main.js'))
		.pipe(gulpif(isProduction, rename(path => {
			path.extname = '.min.js'
		})))
		.pipe(gulp.dest('./dist/js/'))
}

function cleanjs() {
	// after all vendor scripts were concatened into main JS file, just delete it
	let filesToDelete = ['./dist/js/vendors.js']

	// if we are in production mode => delete the main transpiled filed and leave only minified version
	if (isProduction) {
		filesToDelete = isProduction ? [...filesToDelete, './dist/js/main.js'] : filesToDelete
	}

	return del(filesToDelete)
}

function watch() {
	watchFor('./src/stylesheets/**/*.scss', styles)
	watchFor('./src/templates/**/*.hbs', templates)
	watchFor('./src/scripts/**/*.js', scripts)
	watchFor('./src/images/**/*', images)
	watchFor('./src/fonts/**/*', fonts)
}

function staticServer() {
	return gulp.src('./dist')
		.pipe(webserver())
}

function serve() {
	return server.init({
		proxy: 'localhost:8000'
	})
}

const defaultTask = parallel(staticServer, serve, watch)

const scripts = series(lint, vendorsjs, transpilejs, concatjs, cleanjs)

const build = series(
	setProductionMode,
	clean,
	parallel(templates, styles, scripts, images, fonts, svg),
	validateTemplates
)

exports.default = defaultTask
exports.templates = templates
exports.clean = clean
exports.styles = styles
exports.images = images
exports.fonts = fonts
exports.scripts = scripts
exports.svg = svg
exports.eslint = lint
exports.build = build
exports.validateTemplates = validateTemplates

exports.init = series(
	clean,
	parallel(templates, styles, scripts, images, fonts, svg),
	defaultTask
)