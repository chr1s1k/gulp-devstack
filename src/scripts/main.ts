import { init, initMultiple } from './init'

import Document from './components/Document'
import Clickable from './components/Clickable'

const app = {
	run() {
		init(Document, document.documentElement)
		initMultiple(Clickable, document.querySelectorAll('.js-clickable'))
	}
}

app.run()