export default function(element) {

	const classesName = {
		JS_HOVER: 'js-hover'
	}

	element.addEventListener('click', () => {
		const link = element.querySelector('a')
		const linkUrl = link.getAttribute('href')
		let newWindowOpened = true

		if (link.getAttribute('target') === '_blank') {
			newWindowOpened = window.open(linkUrl)
		} else {
			window.location.href = linkUrl
		}

		if (!newWindowOpened) {
			window.location.href = linkUrl
		}

		return false
	})

	element.addEventListener('mouseenter', () => {
		element.classList.add(classesName.JS_HOVER)
	})

	element.addEventListener('mouseleave', () => {
		element.classList.remove(classesName.JS_HOVER)
	})

}