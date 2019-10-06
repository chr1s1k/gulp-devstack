import 'core-js/modules/es.array.from'

interface IBlueimp {
	Gallery: (list: NodeList | HTMLCollection, options?: object) => void;
}

// extend window with custom objects
declare global {
	interface Window {
		blueimp: IBlueimp
	}
}

import { init, initMultiple } from './init'

import Document from './components/Document'
import Clickable from './components/Clickable'
import Gallery from './components/Gallery'

const app = {
	run() {
		init(Document, document.documentElement)
		initMultiple(Clickable, document.querySelectorAll('.js-clickable'))
		init(Gallery, document.querySelector('.js-gallery'))
	}
}

app.run()