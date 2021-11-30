# Frontend devstack based on Gulp

## Features

- [Bootstrap](https://getbootstrap.com/) 5.x
- [Sass](https://sass-lang.com/)
- [Handlebars](https://handlebarsjs.com/)
- [Typescript](http://www.typescriptlang.org/) 4.x
- [SVG sprite](https://github.com/jkphl/gulp-svg-sprite)
- [ESLint](https://eslint.org/)
- [blueimp Gallery](https://github.com/blueimp/Gallery)
- [Lazyloading](https://github.com/VelociraptorCZE/MiniLazyload) of images and iframes
- Local webserver with [Browsersync](https://browsersync.io) and [mocked API](https://github.com/muratcorlu/connect-api-mocker) support
- Run linters against staged git files using [lint-staged](https://github.com/okonet/lint-staged) & [Husky](https://typicode.github.io/husky) hooks
- Bundled using [Gulp](https://gulpjs.com/) & [Webpack](https://webpack.js.org/)

## Setup

Install [Yarn](https://yarnpkg.com/lang/en/).

## Installation

`yarn install`

## Usage

### Development

To compile assets, start development server with watch task run:

`gulp` or `yarn start`

### Production build

To compile & minify all assets ready for production deployment run:

`gulp build` or `yarn build`

### Production package

To create a ZIP package from compiled & minified assets run:

`gulp zip` or `yarn zip`

## Tips

To make your website a bit dynamic without using jQuery or React, I strongly recommend to use [Alpine.js framework](https://alpinejs.dev/).

```cmd
yarn add alpinejs
```

## Known issues

If husky `precommit` hook doesn't work, try to run `yarn husky add .husky/pre-commit "yarn precommit"`.
