# Frontend devstack based on Gulp

## Features

- [Bootstrap](https://getbootstrap.com/) 4.x
- [jQuery](https://jquery.com/) (I know, it's old school, but I'm waiting for Bootstrap v5.)
- [Handlebars](https://handlebarsjs.com/)
- [Typescript](http://www.typescriptlang.org/) 3.x
- [SVG sprite](https://github.com/jkphl/gulp-svg-sprite)
- [ESLint](https://eslint.org/)
- Local [webserver](https://github.com/schickling/gulp-webserver) with [Browsersync](https://browsersync.io) support

## Setup

Install [Yarn](https://yarnpkg.com/lang/en/).

## Installation

```yarn install```

## Usage

### Development

To compile assets, start development server with watch task run:

```gulp init```

To start development server with watch task run:

```gulp```

### Production build

To compile & minify all assets ready for production deployment run:

```gulp build```