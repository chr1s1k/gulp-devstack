export default function(element) {

	// check if data attribute with target exists
	if (!element.dataset.target) {
		return
	}

	let isInTransition = false

	const ANIMATION_DURATION = 350
	const classNames = {
		COLLAPSING: 'collapsing',
		COLLAPSED: 'collapsed',
		COLLAPSE: 'collapse',
		SHOW: 'show'
	}

	const firstChar = element.dataset.target.charAt(0)

	// if first character of target attribute is # => then substr
	const targetId = firstChar === '#' ? element.dataset.target.substr(1) : element.dataset.target

	const target = document.getElementById(targetId)

	if (!target) {
		return
	}

	const isCollapsed = target => target.classList.contains(classNames.COLLAPSE)

	element.addEventListener('click', () => {
		if (!isInTransition) {
			target.classList.add(classNames.COLLAPSING)
			target.classList.remove(classNames.COLLAPSE)
			target.classList.remove(classNames.SHOW)

			setTimeout(() => {
				if (isCollapsed(target)) {
					console.log('collapsed')
				}
			}, ANIMATION_DURATION)
		}
	})
}