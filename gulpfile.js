import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

import { readFile } from 'fs/promises'
const packageJson = JSON.parse(await readFile(new URL('./package.json', import.meta.url)))

import gulpPkg from 'gulp'
const { src, series, parallel, dest, watch: watchFor } = gulpPkg

import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import browserSync from 'browser-sync'
import plumber from 'gulp-plumber'
import beeper from 'beeper'
import colors from 'ansi-colors'
import fancylog from 'fancy-log'
import gulpUglify from 'gulp-uglify-es'
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

// https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl#answer-62892482
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sass = gulpSass(dartSass)
const uglify = gulpUglify.default

const errorHandler = (err) => {
  beeper() // terminal beep
  fancylog(
    colors.bold.red(err.message), // log a colored message
  )
}

const server = browserSync.create()
const mockServer = apiMocker('/api', './src/mocks/api')

let isProduction = false

const setProductionMode = (done) => {
  isProduction = true
  done()
}

const clean = () => del('./dist')

const templates = () => {
  return src('./src/templates/*.hbs')
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
    .pipe(dest('./dist'))
    .pipe(server.stream({ reload: true }))
}

const styles = () => {
  return (
    src('./src/stylesheets/*.scss', { sourcemaps: true })
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
          quietDeps: true,
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
      .pipe(dest('./dist/css', { sourcemaps: !isProduction && '.' }))
      .pipe(server.stream())
  )
}

const bundlejs = (done) => {
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

const images = () => {
  return src(['./src/images/**/*', '!./src/images/sprite/**', '!./src/images/favicon/**'])
    .pipe(imagemin())
    .pipe(dest('./dist/images'))
}

const faviconImages = () => {
  return src([
    './src/images/favicon/*.png',
    './src/images/favicon/*.svg',
    './src/images/favicon/*.ico',
  ]).pipe(dest('./dist/images'))
}

const faviconConfig = () => {
  return src(['./src/images/favicon/*.xml', './src/images/favicon/*.webmanifest']).pipe(
    dest('./dist'),
  )
}

const fonts = () => {
  return src('./src/fonts/**/*').pipe(dest('./dist/fonts'))
}

const svg = () => {
  return src('./src/images/sprite/*.svg')
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
    .pipe(dest('./dist/images'))
}

const lint = () => {
  return src(['./src/scripts/**/*.ts', '!./src/scripts/vendor/**/*'])
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

const validateTemplates = () => {
  return src('./dist/*.html')
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

const vendorjs = () => {
  return src('./src/scripts/vendor/index.js')
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
    .pipe(dest('./dist/js'))
}

const copyRootFiles = () => {
  return src(['./src/root/**/*']).pipe(dest('./dist'))
}

const createZip = () => {
  const zipFileName = `${packageJson.name}-${packageJson.version}.zip`
  return src('./dist/**/*').pipe(zip(zipFileName)).pipe(dest('./dist'))
}

const increasePackageVersion = () => {
  return src('./package.json').pipe(gulpif(isProduction, bump())).pipe(dest('./'))
}

const watch = () => {
  watchFor('./src/stylesheets/**/*.scss', styles)
  watchFor('./src/templates/**/*.hbs', templates)
  watchFor(['./src/scripts/**/*.ts', './src/scripts/vendor/*.js'], scripts)
  watchFor('./src/images/**/*', images)
  watchFor('./src/images/sprite/**/*', svg)
  watchFor('./src/fonts/**/*', fonts)
}

const serve = () => {
  return server.init({
    server: {
      baseDir: './dist',
      middleware: [mockServer],
    },
  })
}

const scripts = series(lint, vendorjs, bundlejs)

const favicons = parallel(faviconImages, faviconConfig)

const build = series(
  setProductionMode,
  clean,
  parallel(templates, styles, scripts, images, favicons, fonts, svg, copyRootFiles),
  increasePackageVersion,
  validateTemplates,
)

export {
  templates,
  clean,
  styles,
  images,
  favicons,
  fonts,
  scripts,
  svg,
  eslint as lint,
  build,
  validateTemplates,
  bundlejs,
  createZip as zip,
}

export default series(
  clean,
  parallel(templates, styles, scripts, images, favicons, fonts, svg, copyRootFiles),
  parallel(serve, watch),
)
