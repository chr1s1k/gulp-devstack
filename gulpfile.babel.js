import packageJson from './package.json'

import path from 'path'
import gulp, { series, parallel, watch as watchFor } from 'gulp'
import sass from 'gulp-sass'
import browserSync from 'browser-sync'
import plumber from 'gulp-plumber'
import beeper from 'beeper'
import colors from 'ansi-colors'
import fancylog from 'fancy-log'
import uglify from 'gulp-uglify-es'
import include from 'gulp-include'
import del from 'del'
import webpack from 'webpack'
import handlebars from 'gulp-compile-handlebars'
import rename from 'gulp-rename'
import imagemin from 'gulp-imagemin'
import svgsprite from 'gulp-svg-sprite'
import eslint from 'gulp-eslint'
import gulpif from 'gulp-if'
import prettify from 'gulp-prettify'
import w3cjs from 'gulp-w3cjs'
import zip from 'gulp-zip'
import bump from 'gulp-bump'
import autoprefixer from 'gulp-autoprefixer'
import postcss from 'gulp-postcss'
import inlineSVG from 'postcss-inline-svg'
import apiMocker from 'connect-api-mocker'

const errorHandler = async (err) => {
  await beeper() // terminal beep
  fancylog(
    colors.bold.red(err.message), // log a colored message
  )
}

const server = browserSync.create()
const mockServer = apiMocker('/api', './src/mocks/api')

let isProduction = false

function setProductionMode(done) {
  isProduction = true
  done()
}

function clean() {
  return del('./dist')
}

function templates() {
  return gulp
    .src('./src/templates/*.hbs')
    .pipe(
      handlebars(
        {
          isProduction, // pass the variable to be available inside .hbs templates
          appVersion: packageJson.version,
        },
        {
          ignorePartials: true,
          batch: ['./src/templates/partials'], // where to locate partial templates
          helpers: {
            parse: (options) => {
              return options.fn(JSON.parse(options.hash.json))
            },
          },
        },
      ),
    )
    .pipe(
      rename((path) => {
        path.extname = '.html'
      }),
    )
    .pipe(
      gulpif(
        isProduction,
        prettify({
          indent_handlebars: true,
          indent_inner_html: true,
          indent_char: ' ',
          indent_size: 2,
          unformatted: ['script', 'style'],
        }),
      ),
    )
    .pipe(gulp.dest('./dist'))
    .pipe(server.stream({ reload: true }))
}

function styles() {
  return (
    gulp
      .src('./src/stylesheets/*.scss', { sourcemaps: true })
      .pipe(
        plumber({
          errorHandler,
        }),
      )
      .pipe(
        sass({
          precision: 8,
          outputStyle: isProduction ? 'compressed' : 'expanded',
          includePaths: ['./node_modules/'],
        }).on('error', sass.logError),
      )
      .pipe(
        autoprefixer({
          flexbox: false,
          grid: false,
        }),
      )
      .pipe(postcss([inlineSVG()]))
      .pipe(
        gulpif(
          isProduction,
          rename((path) => {
            path.extname = '.min.css'
          }),
        ),
      )
      // write an external sourcemaps, but only in development mode
      .pipe(gulp.dest('./dist/css', { sourcemaps: !isProduction && '.' }))
      .pipe(server.stream())
  )
}

function bundlejs(done) {
  const config = {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
    entry: {
      main: './src/scripts/main.ts',
    },
    output: {
      path: path.resolve(__dirname, './dist/js'),
      filename: isProduction ? '[name].min.js' : '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          loader: 'awesome-typescript-loader',
          exclude: [/node_modules/, /dist/],
        },
      ],
    },
    plugins: [
      new webpack.ProgressPlugin(),
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
            server.reload()
          })
        },
      },
    ],
  }

  webpack(config, (error, stats) => {
    const jsonStats = stats.toJson()
    const errors = jsonStats.errors
    const warnings = jsonStats.warnings
    const statsConfig = {
      assets: true,
      modules: false,
      colors: true,
      timings: true,
    }

    if (error) {
      fancylog(colors.bold.red(error))
      beeper()
    } else if (errors.length) {
      fancylog(colors.bold.red(JSON.stringify(errors)))
      beeper()
    } else if (warnings.length) {
      fancylog(colors.bold.redBright(JSON.stringify(warnings)))
      beeper()
    } else {
      fancylog(stats.toString(statsConfig))
    }
  })

  done()
}

function images() {
  return gulp
    .src(['./src/images/**/*', '!./src/images/sprite/**', '!./src/images/favicon/**'])
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/images'))
}

function faviconImages() {
  return gulp
    .src(['./src/images/favicon/*.png', './src/images/favicon/*.svg', './src/images/favicon/*.ico'])
    .pipe(gulp.dest('./dist/images'))
}

function faviconConfig() {
  return gulp
    .src(['./src/images/favicon/*.xml', './src/images/favicon/*.webmanifest'])
    .pipe(gulp.dest('./dist'))
}

function fonts() {
  return gulp.src('./src/fonts/**/*').pipe(gulp.dest('./dist/fonts'))
}

function svg() {
  return gulp
    .src('./src/images/sprite/*.svg')
    .pipe(
      svgsprite({
        mode: {
          symbol: {
            dest: '',
            sprite: 'sprite.svg',
          },
        },
      }),
    )
    .pipe(gulp.dest('./dist/images'))
}

function lint() {
  return gulp
    .src(['./src/scripts/**/*.ts', '!./src/scripts/vendor/**/*'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(
      eslint.result((result) => {
        if (result.errorCount) {
          beeper() // if at least one eslint error has found => just beep the terminal
        }
      }),
    )
    .pipe(eslint.failAfterError())
}

function validateTemplates() {
  return gulp
    .src('./dist/*.html')
    .pipe(
      w3cjs({
        verifyMessage: (type, message) => {
          // prevent logging error message in for src attribute of images
          if (
            message.indexOf(
              "Bad value “data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'",
            ) !== -1 ||
            message.indexOf('Element “img” is missing required attribute “src”') !== -1 ||
            message.indexOf('Element “style” not allowed as child of element') !== -1
          ) {
            return false
          }

          // allow message to pass through
          return true
        },
      }),
    )
    .pipe(w3cjs.reporter())
}

function vendorjs() {
  return gulp
    .src('./src/scripts/vendor/index.js')
    .pipe(
      plumber({
        errorHandler,
      }),
    )
    .pipe(
      include({
        includePaths: ['./node_modules'],
      }),
    )
    .pipe(
      rename((path) => {
        path.basename = 'vendor'
      }),
    )
    .pipe(gulpif(isProduction, uglify()))
    .pipe(
      gulpif(
        isProduction,
        rename((path) => {
          path.extname = '.min.js'
        }),
      ),
    )
    .pipe(gulp.dest('./dist/js'))
}

function createZip() {
  const zipFileName = `${packageJson.name}-${packageJson.version}.zip`

  return gulp.src('./dist/**/*').pipe(zip(zipFileName)).pipe(gulp.dest('./dist'))
}

function increasePackageVersion() {
  return gulp.src('./package.json').pipe(gulpif(isProduction, bump())).pipe(gulp.dest('./'))
}

function watch() {
  watchFor('./src/stylesheets/**/*.scss', styles)
  watchFor('./src/templates/**/*.hbs', templates)
  watchFor(['./src/scripts/**/*.ts', './src/scripts/vendor/*.js'], scripts)
  watchFor('./src/images/**/*', images)
  watchFor('./src/images/sprite/**/*', svg)
  watchFor('./src/fonts/**/*', fonts)
}

function serve() {
  return server.init({
    server: {
      baseDir: './dist',
      middleware: [mockServer],
    },
  })
}

const defaultTask = parallel(serve, watch)

const scripts = series(lint, vendorjs, bundlejs)

const favicons = parallel(faviconImages, faviconConfig)

const build = series(
  setProductionMode,
  clean,
  parallel(templates, styles, scripts, images, favicons, fonts, svg),
  increasePackageVersion,
  validateTemplates,
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
exports.package = createZip
exports.zip = createZip

exports.init = series(
  clean,
  parallel(templates, styles, scripts, images, favicons, fonts, svg),
  defaultTask,
)
