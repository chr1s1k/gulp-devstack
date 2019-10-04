import { init, initMultiple } from './init'

import Document from './components/Document'
import Collapse from './components/Collapse'

const app = {
	run() {
		init(Document, document.documentElement)
		initMultiple(Collapse, document.querySelectorAll('[data-toggle="collapse"]'))
	}
}

app.run()