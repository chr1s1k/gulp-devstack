import 'core-js/modules/es.array.from'

interface IBlueimp {
  Gallery: (list: NodeList | HTMLCollection, options?: object) => void
}

interface IMiniLazyload {
  (options?: object, selector?: string, ignoreNative?: boolean): void
  IGNORE_NATIVE_LAZYLOAD: boolean
}

// extend window with custom objects
declare global {
  interface Window {
    blueimp: IBlueimp
    MiniLazyload: IMiniLazyload
    initUI: (container: HTMLElement | Document) => void
  }
}

import { init, initMultiple } from './init'

import { Document, Clickable, Gallery, Lazyload, Navbar } from './components'

const app = {
  runOnce() {
    init(Document, document.documentElement)
    init(Navbar, document.getElementById('nav'))
  },
  run(container: HTMLElement | Document) {
    initMultiple(Clickable, container.querySelectorAll('.js-clickable'))
    initMultiple(Gallery, container.querySelectorAll('.js-gallery'))

    // initialization of lazyload
    Lazyload('.js-lazyload')
  },
}

app.runOnce()
app.run(document)

// expose run function as initUI, so it can be called by other scripts
window.initUI = app.run
