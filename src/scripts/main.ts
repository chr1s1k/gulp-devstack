import 'core-js/modules/es.array.from'

import { init, initMultiple } from './init'

import { Document, Clickable, Gallery, Lazyload, Navbar } from './components'

type IBlueimp = {
  Gallery: (list: NodeList | HTMLCollection, options?: Record<string, unknown>) => void
}

type IMiniLazyload = {
  (options?: Record<string, unknown>, selector?: string, ignoreNative?: boolean): void
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
