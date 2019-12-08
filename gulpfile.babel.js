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
import tsify from 'tsify'

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
			batch: ['./src/templates/partials'], // where to locate partial templates
			helpers: {
				parse: (options) => {
					return options.fn(JSON.parse(options.hash.json))
				}
			}
		}))
		.pipe(rename(path => {
			path.extname = '.html'
		}))
		.pipe(gulpif(isProduction, prettify({
			indent_handlebars: true,
			indent_inner_html: true,
			indent_char: ' ',
			indent_size: 2,
			unformatted: ['script', 'style']
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
function bundlejs() {
	return browserify({
		entries: './src/scripts/main.ts',
		debug: !isProduction,
	})
		.plugin(tsify)
		.transform('babelify', {
			presets: ['@babel/preset-env'],
			extensions: ['.ts', '.js']
		})
		.bundle()
		.pipe(source('main.js'))
		.pipe(buffer())
		.pipe(gulpif(isProduction, uglify()))
		.pipe(gulpif(isProduction, rename(path => {
			path.extname = '.min.js'
		})))
		.pipe(gulp.dest('./dist/js'))
		.pipe(server.stream({ stream: true }))
}

function images() {
	return gulp.src(['./src/images/**/*', '!./src/images/sprite/**'])
		.pipe(imagemin())
		.pipe(gulp.dest('./dist/images'))
}

function faviconImages() {
	return gulp
		.src([
			'./src/images/favicon/*.png',
			'./src/images/favicon/*.svg',
			'./src/images/favicon/*.ico'
		])
		.pipe(gulp.dest('./dist/images'))
}

function faviconConfig() {
	return gulp
		.src([
			'./src/images/favicon/*.xml',
			'./src/images/favicon/*.webmanifest',
		])
		.pipe(gulp.dest('./dist'))
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
	return gulp.src(['./src/scripts/**/*.ts', '!./src/scripts/vendor/**/*'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.result(result => {
			if (result.errorCount) {
				beeper() // if at least one eslint error has found => just beep the terminal
			}
		}))
		.pipe(eslint.failAfterError())
}

function validateTemplates() {
	return gulp.src('./dist/*.html')
		.pipe(w3cjs())
		.pipe(w3cjs.reporter())
}

function vendorjs() {
	return gulp.src('./src/scripts/vendor/index.js')
		.pipe(plumber({
			errorHandler
		}))
		.pipe(include({
			includePaths: [
				'./node_modules'
			]
		}))
		.pipe(rename(path => {
			path.basename = 'vendor'
		}))
		.pipe(gulpif(isProduction, uglify()))
		.pipe(gulpif(isProduction, rename(path => {
			path.extname = '.min.js'
		})))
		.pipe(gulp.dest('./dist/js'))
}

function watch() {
	watchFor('./src/stylesheets/**/*.scss', styles)
	watchFor('./src/templates/**/*.hbs', templates)
	watchFor(['./src/scripts/**/*.ts', './src/scripts/vendor/*.js'], scripts)
	watchFor('./src/images/**/*', images)
	watchFor('./src/images/sprite/**/*', svg)
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

const scripts = series(lint, vendorjs, bundlejs)

const favicons = parallel(faviconImages, faviconConfig)

const build = series(
	setProductionMode,
	clean,
	parallel(templates, styles, scripts, images, favicons, fonts, svg),
	validateTemplates
)

exports.default = defaultTask
exports.templates = templates
exports.clean = clean
exports.styles = styles
exports.images = images
exports.favicons = favicons
exports.fonts = fonts
exports.scripts = scripts
exports.svg = svg
exports.eslint = lint
exports.build = build
exports.validateTemplates = validateTemplates
exports.bundlejs = bundlejs

exports.init = series(
	clean,
	parallel(templates, styles, scripts, images, favicons, fonts, svg),
	defaultTask
)