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
