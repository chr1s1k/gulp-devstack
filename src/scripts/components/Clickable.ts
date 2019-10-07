export default function Clickable(container: HTMLElement) {

	const classesName = {
		JS_HOVER: 'js-hover'
	}

	container.addEventListener('click', () => {
		const link = container.querySelector('a')

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

	container.addEventListener('mouseenter', () => {
		container.classList.add(classesName.JS_HOVER)
	})

	container.addEventListener('mouseleave', () => {
		container.classList.remove(classesName.JS_HOVER)
	})

}