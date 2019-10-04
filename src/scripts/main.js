import { init } from './init'
// import { initMultiple } from './init'

import Document from './components/Document'

const app = {
	run() {
		init(Document, document.documentElement)
	}
}

app.run()