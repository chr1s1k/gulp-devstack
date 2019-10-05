export default function(element: HTMLElement) {

	const classesName = {
		JS_HOVER: 'js-hover'
	}

	element.addEventListener('click', () => {
		const link = element.querySelector('a')
		
		if (link) {
			const linkUrl: string = link.getAttribute('href') || ''
			let newWindowOpened = true

			if (link.getAttribute('target') === '_blank') {
				newWindowOpened = window.open(linkUrl) ? true : false
			} else {
				window.location.href = linkUrl
			}

			if (!newWindowOpened) {
				window.location.href = linkUrl
			}

			return false
		}
	})

	element.addEventListener('mouseenter', () => {
		element.classList.add(classesName.JS_HOVER)
	})

	element.addEventListener('mouseleave', () => {
		element.classList.remove(classesName.JS_HOVER)
	})

}