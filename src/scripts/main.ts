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
	}
}

import { init, initMultiple } from './init'

import Document from './components/Document'
import Clickable from './components/Clickable'
import Gallery from './components/Gallery'
import Lazyload from './components/Lazyload'

const app = {
	run() {
		init(Document, document.documentElement)
		initMultiple(Clickable, document.querySelectorAll('.js-clickable'))
		init(Gallery, document.querySelector('.js-gallery'))

		// initialization of lazyload
		Lazyload('.js-lazyload')
	}
}

app.run()
